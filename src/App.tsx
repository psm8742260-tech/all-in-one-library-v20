import React, { useState, useEffect } from 'react';
import { User, Book, Folder, CreditTransaction, LanguageCode, TRANSLATIONS, WriterApplication, RegisteredTree } from './types';
import { INITIAL_BOOKS } from './data/books';
import Splash from './components/Splash';
import Dashboard from './components/Dashboard';
import Reader from './components/Reader';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  // Historical credit transaction log
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Active book being read in full-screen reader mode
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  
  // Standard Pre-loaded folders with localStorage persistence
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('library_folders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.some((f: any) => f.id === 'fol-talapatra')) {
          parsed.push({ id: 'fol-talapatra', name: 'తాళపత్ర గ్రంథాలు', parentId: null });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading stored folders', e);
    }
    return [
      { id: 'fol-classics', name: 'Classics', parentId: null },
      { id: 'fol-scifi', name: 'Science Fiction', parentId: null },
      { id: 'fol-philosophy', name: 'Strategy & Philosophy', parentId: null },
      { id: 'fol-talapatra', name: 'తాళపత్ర గ్రంథాలు', parentId: null }
    ];
  });

  // Save folders to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('library_folders', JSON.stringify(folders));
    } catch (e) {
      console.error('Error saving folders', e);
    }
  }, [folders]);

  // Initial books catalog with localStorage permanent persistence and state-level sorting
  const [books, setBooksState] = useState<Book[]>(() => {
    let loadedBooks: Book[] = [];
    let hasLoaded = false;
    try {
      const saved = localStorage.getItem('library_all_books');
      if (saved) {
        loadedBooks = JSON.parse(saved);
        hasLoaded = true;
      }
    } catch (e) {
      console.error('Error loading stored books', e);
    }

    if (!hasLoaded) {
      loadedBooks = INITIAL_BOOKS.map(book => {
        let folderId: string | undefined = undefined;
        const desc = book.description || '';
        const cat = book.category || '';
        const title = book.title || '';
        const isPalm = title.toLowerCase().includes('తాళపత్ర') || desc.toLowerCase().includes('తాళపత్ర') || cat.toLowerCase().includes('తాళపత్ర') ||
                       title.toLowerCase().includes('talapatra') || desc.toLowerCase().includes('talapatra') || cat.toLowerCase().includes('talapatra') ||
                       title.toLowerCase().includes('palm leaf') || desc.toLowerCase().includes('palm leaf') || cat.toLowerCase().includes('palm leaf') ||
                       title.toLowerCase().includes('manuscript') || desc.toLowerCase().includes('manuscript') || cat.toLowerCase().includes('manuscript');
        if (isPalm) {
          folderId = 'fol-talapatra';
        } else if (book.category.toLowerCase().includes('strategy') || book.category.toLowerCase().includes('philosophy')) {
          folderId = 'fol-philosophy';
        } else if (book.category.toLowerCase().includes('fiction') || book.category.toLowerCase().includes('fantasy')) {
          folderId = 'fol-classics';
        } else if (book.category.toLowerCase().includes('science')) {
          folderId = 'fol-scifi';
        }
        return { ...book, folderId, isUnlocked: false };
      });
    } else {
      // Force map existing cached books to the palm-leaf folder if matching keywords
      loadedBooks = loadedBooks.map(book => {
        const desc = book.description || '';
        const cat = book.category || '';
        const title = book.title || '';
        const isPalm = title.toLowerCase().includes('తాళపత్ర') || desc.toLowerCase().includes('తాళపత్ర') || cat.toLowerCase().includes('తాళపత్ర') ||
                       title.toLowerCase().includes('talapatra') || desc.toLowerCase().includes('talapatra') || cat.toLowerCase().includes('talapatra') ||
                       title.toLowerCase().includes('palm leaf') || desc.toLowerCase().includes('palm leaf') || cat.toLowerCase().includes('palm leaf') ||
                       title.toLowerCase().includes('manuscript') || desc.toLowerCase().includes('manuscript') || cat.toLowerCase().includes('manuscript');
        if (isPalm && book.folderId !== 'fol-talapatra') {
          return { ...book, folderId: 'fol-talapatra' };
        }
        return book;
      });
    }

    return [...loadedBooks].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'accent', numeric: true }));
  });

  // Wrapper setter to guarantee A-to-Z alphabetical sorting across the whole system
  const setBooks = (updatedBooks: Book[] | ((prev: Book[]) => Book[])) => {
    setBooksState(prev => {
      const next = typeof updatedBooks === 'function' ? updatedBooks(prev) : updatedBooks;
      return [...next].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'accent', numeric: true }));
    });
  };

  // Save books to localStorage whenever updated
  useEffect(() => {
    try {
      if (books.length > 0) {
        localStorage.setItem('library_all_books', JSON.stringify(books));
      }
    } catch (e) {
      console.error('Error saving books to storage', e);
    }
  }, [books]);

  // Initialize DeepSeek settings with default working key if not present
  useEffect(() => {
    try {
      const savedDs = localStorage.getItem('deepseek_settings');
      if (!savedDs) {
        const defaultSettings = {
          useDeepSeek: true,
          apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat'
        };
        localStorage.setItem('deepseek_settings', JSON.stringify(defaultSettings));
        if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
          localStorage.setItem('deepseek_api_key', import.meta.env.VITE_DEEPSEEK_API_KEY);
        }
      }
    } catch (e) {
      console.error('Error initializing deepseek settings', e);
    }
  }, []);

  // Handler: Login with Gmail Simulation
  const handleLogin = (email: string, name: string) => {
    setUser({
      email,
      name,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      credits: 200 // Starter credits bonus
    });

    // Add first sign-up bonus transaction log
    const timestamp = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    const bonusTx: CreditTransaction = {
      id: `tx-init-${Date.now()}`,
      timestamp,
      amount: 200,
      description: 'New account starter reward bonus',
      type: 'bonus'
    };
    setTransactions([bonusTx]);
  };

  // Handler: Logout
  const handleLogout = () => {
    setUser(null);
    setActiveBook(null);
  };

  // Handler: Deduct Credits and Add Transaction Log
  const handleDeductCredits = (amount: number, description: string) => {
    if (!user) return;
    
    // Deduct
    const updatedCredits = Math.max(0, user.credits - amount);
    setUser(prev => prev ? { ...prev, credits: updatedCredits } : null);

    // Register log
    const timestamp = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    const newTx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      timestamp,
      amount: -amount,
      description,
      type: 'session'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Add Custom General Transaction (e.g. unlock, top-up)
  const handleAddTransaction = (
    amount: number, 
    description: string, 
    type: 'unlock' | 'session' | 'topup' | 'bonus'
  ) => {
    const timestamp = new Date().toLocaleString([], { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
    const newTx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      timestamp,
      amount,
      description,
      type
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Update Active user credits directly (e.g. from top up or buy unlock)
  const handleUpdateCredits = (newCredits: number) => {
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  // Handler: Admin Add Book directly to library
  const handleAddBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
  };

  // Handler: Admin Delete Book from library
  const handleDeleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  // Handle Writer Application with localStorage permanent persistence
  const [writerApplications, setWriterApplications] = useState<WriterApplication[]>(() => {
    try {
      const saved = localStorage.getItem('library_writer_applications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading stored applications', e);
    }
    return [];
  });

  // Save applications to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('library_writer_applications', JSON.stringify(writerApplications));
    } catch (e) {
      console.error('Error saving applications', e);
    }
  }, [writerApplications]);

  const handleRegisterWriter = (application: WriterApplication) => {
    setWriterApplications(prev => [application, ...prev]);
  };

  const handleApproveApplication = (app: WriterApplication) => {
    app.status = 'approved';
    setWriterApplications(prev => [...prev]);
  };

  // Handle Registered Trees with localStorage permanent persistence
  const [registeredTrees, setRegisteredTrees] = useState<RegisteredTree[]>(() => {
    try {
      const saved = localStorage.getItem('library_registered_trees');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading stored registered trees', e);
    }
    return [];
  });

  // Save registered trees to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('library_registered_trees', JSON.stringify(registeredTrees));
    } catch (e) {
      console.error('Error saving registered trees', e);
    }
  }, [registeredTrees]);

  const handleRegisterTree = (tree: RegisteredTree) => {
    setRegisteredTrees(prev => [tree, ...prev]);
  };

  const handleApproveTree = (treeId: string) => {
    setRegisteredTrees(prev => prev.map(t => t.id === treeId ? { ...t, status: 'approved' as const } : t));
  };

  const handleRejectTree = (treeId: string) => {
    setRegisteredTrees(prev => prev.map(t => t.id === treeId ? { ...t, status: 'rejected' as const } : t));
  };

  const handleDeleteTree = (treeId: string) => {
    setRegisteredTrees(prev => prev.filter(t => t.id !== treeId));
  };

  return (
    <div className="w-full h-full min-h-screen bg-orange-50 text-slate-900 font-sans selection:bg-orange-500/30">
      {!user ? (
        <Splash 
          onLogin={handleLogin}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      ) : activeBook ? (
        <Reader
          book={activeBook}
          credits={user.credits}
          onClose={() => setActiveBook(null)}
          onDeductCredits={handleDeductCredits}
          currentLanguage={currentLanguage}
        />
      ) : (
        <Dashboard
          user={user}
          books={books}
          folders={folders}
          transactions={transactions}
          onLogout={handleLogout}
          onUpdateUserCredits={handleUpdateCredits}
          onAddTransaction={handleAddTransaction}
          onUpdateBooks={setBooks}
          onUpdateFolders={setFolders}
          onAddBook={handleAddBook}
          onDeleteBook={handleDeleteBook}
          writerApplications={writerApplications}
          onRegisterWriter={handleRegisterWriter}
          onApproveWriterApplication={handleApproveApplication}
          registeredTrees={registeredTrees}
          onRegisterTree={handleRegisterTree}
          onApproveTree={handleApproveTree}
          onRejectTree={handleRejectTree}
          onDeleteTree={handleDeleteTree}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onOpenReader={setActiveBook}
        />
      )}
    </div>
  );
}
