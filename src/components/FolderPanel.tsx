import React, { useState } from 'react';
import { 
  Folder as FolderIcon, FolderPlus, Trash2, Edit2, ChevronRight, 
  ChevronDown, BookOpen, Move, Plus, X, ListFilter, AlertCircle, Settings
} from 'lucide-react';
import { Folder, Book, LanguageCode, TRANSLATIONS } from '../types';

interface FolderPanelProps {
  folders: Folder[];
  books: Book[];
  activeFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveBook: (bookId: string, folderId: string | null) => void;
  onOpenAdminPanel: () => void;
  currentLanguage: LanguageCode;
  isAdmin?: boolean;
}

export default function FolderPanel({
  folders,
  books,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveBook,
  onOpenAdminPanel,
  currentLanguage,
  isAdmin = false
}: FolderPanelProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [movingBookId, setMovingBookId] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), createParentId);
      setNewFolderName('');
      setShowCreateModal(false);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (editName.trim()) {
      onRenameFolder(id, editName.trim());
      setEditingFolderId(null);
      setEditName('');
    }
  };

  // Helper: render folder item recursively with depth indentation
  const renderFolderItem = (folder: Folder, depth: number = 0) => {
    const isSelected = activeFolderId === folder.id;
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const folderBooks = books.filter(b => b.folderId === folder.id);

    return (
      <div key={folder.id} className="select-none">
        <div 
          style={{ paddingLeft: `${Math.max(12, depth * 16)}px` }}
          className={`group flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium cursor-pointer transition ${
            isSelected 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 shadow-md' 
              : 'text-slate-900/90 hover:bg-orange-200'
          }`}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <FolderIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`} />
            {editingFolderId === folder.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
                onBlur={() => handleRenameSubmit(folder.id)}
                autoFocus
                className="bg-orange-100 text-slate-900 border border-orange-500 py-0.5 px-1.5 rounded focus:outline-none w-28 text-xs font-medium"
              />
            ) : (
              <span className="truncate">{folder.name} <span className="opacity-60 font-mono text-[10px]">({folderBooks.length})</span></span>
            )}
          </div>

          {/* Action buttons (shown on hover) */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreateParentId(folder.id);
                setShowCreateModal(true);
              }}
              className="p-1 hover:bg-orange-300 rounded text-slate-900 hover:text-slate-950"
              title="Add Subfolder"
              id={`add-subfolder-btn-${folder.id}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {folder.id !== 'fol-talapatra' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolderId(folder.id);
                    setEditName(folder.name);
                  }}
                  className="p-1 hover:bg-orange-300 rounded text-slate-900 hover:text-slate-950"
                  title="Rename Folder"
                  id={`rename-folder-btn-${folder.id}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete folder "${folder.name}"? Books inside will be moved to Library root.`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  className="p-1 hover:bg-orange-300 rounded text-rose-400 hover:text-rose-300"
                  title="Delete Folder"
                  id={`delete-folder-btn-${folder.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Render child folders */}
        {childFolders.length > 0 && (
          <div className="mt-1 border-l border-orange-300 ml-4">
            {childFolders.map(child => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(f => f.parentId === null);
  const unassignedBooks = books.filter(b => !b.folderId);

  return (
    <div className="flex flex-col bg-orange-50 border-r border-orange-300 w-full h-full text-slate-900 p-4">
      {/* Folder Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">{t.folders}</h4>
        </div>
        <button
          onClick={() => {
            setCreateParentId(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1 bg-orange-200 hover:bg-orange-300 border border-orange-300 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-800 transition shadow-sm"
          id="new-root-folder-btn"
        >
          <FolderPlus className="w-3.5 h-3.5 text-orange-400" />
          <span>{t.createFolder}</span>
        </button>
      </div>

      {/* Directory structure */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {/* All Books Root Item */}
        <div 
          onClick={() => onSelectFolder(null)}
          className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm ${
            activeFolderId === null 
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 shadow-orange-950/50' 
              : 'text-slate-900/90 hover:bg-orange-200'
          }`}
          id="folder-all-books"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-900" />
            <span>{t.allBooks}</span>
          </div>
          <span className="font-mono text-[10px] opacity-90 bg-orange-100/30 px-1.5 py-0.5 rounded text-slate-800">
            {books.length}
          </span>
        </div>

        {/* Hierarchical tree folders */}
        <div className="space-y-1 mt-3">
          {rootFolders.map(folder => renderFolderItem(folder, 0))}
          {rootFolders.length === 0 && (
            <div className="text-slate-700/50 text-[11px] text-center py-4 font-mono">
              No custom folders created yet.
            </div>
          )}
        </div>

        {/* Organization / Move section */}
        {books.length > 0 && (
          <div className="mt-8 pt-4 border-t border-orange-200">
            <div className="flex items-center gap-1.5 text-slate-900/80 text-[11px] font-semibold uppercase mb-2">
              <Move className="w-3.5 h-3.5 text-orange-400" />
              <span>Organize Books</span>
            </div>
            
            <div className="space-y-2">
              <select
                onChange={(e) => {
                  const bId = e.target.value;
                  setMovingBookId(bId || null);
                }}
                value={movingBookId || ''}
                className="w-full bg-orange-100 border border-orange-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                id="select-organize-book"
              >
                <option value="">-- Choose Book to Move --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({folders.find(f => f.id === b.folderId)?.name || 'Library Root'})
                  </option>
                ))}
              </select>

              {movingBookId && (
                <select
                  onChange={(e) => {
                    const fId = e.target.value || null;
                    onMoveBook(movingBookId, fId);
                    setMovingBookId(null);
                  }}
                  className="w-full bg-orange-100 border border-orange-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                  id="select-organize-folder"
                >
                  <option value="">-- Select Destination Folder --</option>
                  <option value="root">Library Root</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Admin Panel Settings Icon Button */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-orange-200">
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center justify-between w-full bg-orange-200 hover:bg-orange-300 border border-orange-300 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-black hover:text-slate-950 transition shadow-md group"
              id="folder-panel-admin-settings-btn"
              title="అడ్మిన్ ప్యానెల్ సెట్టింగ్స్"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-black group-hover:rotate-45 transition-transform duration-300" />
                <span className="text-black font-extrabold">{t.adminPanel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-300 text-black border border-amber-400 font-extrabold px-2 py-0.5 rounded-full text-[10px] shadow-sm">
                  Admin
                </span>
                <Settings className="w-4 h-4 text-blue-600 animate-[spin_8s_linear_infinite]" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Create Folder Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-orange-100/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-orange-100 border border-orange-400 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-slate-900">
                {createParentId ? 'Create Subfolder' : 'Create New Folder'}
              </h4>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-700 hover:text-slate-950 p-1"
                id="close-folder-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-900/80 mb-1.5">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter name (e.g., Favorites, Sci-Fi)"
                  className="w-full bg-orange-100 border border-orange-400 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  id="folder-name-input-field"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-orange-300 hover:bg-orange-400 text-slate-800 text-xs px-3.5 py-1.5 rounded-xl transition"
                  id="cancel-folder-create"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 text-xs px-4 py-1.5 rounded-xl transition font-semibold shadow-md"
                  id="submit-folder-create"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
