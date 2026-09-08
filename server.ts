import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint for Cloud Run deployment checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PWA System Association Control Endpoint
app.get('/api/app-control', (req, res) => {
  res.json({
    pwaVersion: '1.0.0',
    maintenanceMode: false,
    activeFeatureFlags: {}
  });
});

const PORT = process.env.PORT || 8080;

// Initialize Google GenAI on the server side lazily to prevent crashing if GEMINI_API_KEY is not defined at startup.
// Note: User-Agent set to 'aistudio-build' is required for AI Studio telemetry.
let _aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || 'DUMMY_KEY_TO_PREVENT_STARTUP_CRASH';
    _aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return _aiInstance;
}

const ai = {
  get models() {
    return getAI().models;
  }
} as any;

function parseBase64DataUri(dataUri: string) {
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

// Endpoint: AI-Powered Chat & Book Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, availableBooks, currentLanguage, deepseekSettings } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMessage = messages[messages.length - 1]?.text || '';

    // Build the system prompt for Brahmastra 3.5 Ultra
    const systemPrompt = `You are "బ్రహ్మాస్త్ర 3.5 అల్ట్రా" (Brahmastra 3.5 Ultra), the Master AI Intelligence & Universal Librarian for the "All in One Library" application.
Your goal is to assist the user with instant book delivery, summaries, voice narration, and reading.
Additionally, you are the "AI వృక్ష నామ శోధన యంత్రం" (AI Plant Detection Engine).

Plant Detection Mode:
- If the user uploads/submits an image or video, analyze it to identify any plant, tree, flower, leaf, seed, or botanical specimen.
- If it is a plant, compile an exhaustive report of its names across multiple Indian languages:
  1. Botanical/Scientific Name (శాస్త్రీయ నామం)
  2. Sanskrit/Cultural Name (సంస్కృత నామం)
  3. Telugu Name (తెలుగు పేరు)
  4. Hindi Name (హిందీ పేరు)
  5. Tamil Name (తమిళ పేరు)
  6. Kannada Name (కన్నడ పేరు)
  7. English Name
  8. An exhaustive list of up to 15-20 other traditional, local, regional, or historical Indian names (ఇతర ప్రాంతీయ నామాలు) and historical meanings.
  9. Medicinal values and environmental benefits of this plant in Telugu.
- Format this plant report beautifully in Telugu (with translations) with clear headings, bullet points, and emojis.
- If it is not a plant, handle it as a standard library query.

Current User Language: ${currentLanguage || 'te'}. Always respond cordially in Telugu if the user writes in Telugu or requested Telugu (or their selected language).

Identity & Delivery Protocol:
- Start with: "హాయ్! నేను మీ బ్రహ్మాస్త్ర 3.5 అల్ట్రా (Brahmastra 3.5 Ultra). మీకు ఏ విధంగా సహాయం చేయగలను?"
- When the user asks for a specific book (via typing or voice recording / audio input), immediately find and provide *only* that requested book in the "recommendedBooks" array.
- Clearly state the exact pricing and access options for the requested book in your reply:
  1. 🔊 ఉచితంగా వినవచ్చు (Free Audio Listening - ₹0)
  2. 📖 ఆన్‌లైన్‌లో చదవడానికి ₹10 (Read Online pass)
  3. 📥 పీడీఎఫ్ డౌన్‌లోడ్ చేసుకోవడానికి ₹29 (Download PDF)

Available pre-loaded books in the system library:
${JSON.stringify(availableBooks || [], null, 2)}

Instructions:
1. When user asks for a book, if it matches an existing book, include its existing ID in "recommendedBooks".
2. If it is a new/external book requested by the user, generate a provisional book object in "recommendedBooks" with a unique ID (e.g. 'gen-123'), accurate title, author, description, category, and costToUnlock: 20, isExternal: true.
3. Keep the "reply" narrative concise, friendly, inspiring, and focused on the requested book with its pricing amounts.`;

    // Check if DeepSeek is enabled and configured
    if (deepseekSettings && deepseekSettings.useDeepSeek && deepseekSettings.apiKey) {
      try {
        console.log('Using DeepSeek for chat response...');
        const baseUrl = (deepseekSettings.baseUrl || 'https://api.deepseek.com').replace(/\/$/, '') + '/chat/completions';
        const model = deepseekSettings.model || 'deepseek-chat';

        const chatMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ];

        const dsResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekSettings.apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: chatMessages,
            response_format: { type: 'json_object' }
          })
        });

        if (!dsResponse.ok) {
          const errText = await dsResponse.text();
          throw new Error(`DeepSeek API error: ${dsResponse.status} ${errText}`);
        }

        const dsData: any = await dsResponse.json();
        const content = dsData.choices?.[0]?.message?.content || '{}';
        const result = JSON.parse(content);
        return res.json(result);
      } catch (dsError: any) {
        console.error('DeepSeek chat failed, falling back to Gemini:', dsError.message);
      }
    }

    const chatMessages = messages.map(msg => {
      const parts: any[] = [];
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      if (msg.imageUrl) {
        const parsed = parseBase64DataUri(msg.imageUrl);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data
            }
          });
        }
      }
      if (msg.videoUrl) {
        const parsed = parseBase64DataUri(msg.videoUrl);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType.startsWith('video') ? 'image/jpeg' : parsed.mimeType,
              data: parsed.data
            }
          });
        }
      }
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: parts.length > 0 ? parts : [{ text: '' }]
      };
    });

    // Generate response using gemini-3.5-flash (more available model)
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...chatMessages
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['reply'],
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The narrative response from the AI Librarian, answering the user\'s query in their active language.',
            },
            recommendedBooks: {
              type: Type.ARRAY,
              description: 'Optional list of recommended books. Pre-loaded books should retain their original ID. Obscure or new books should have generated properties and set isExternal: true.',
              items: {
                type: Type.OBJECT,
                required: ['id', 'title', 'author', 'description', 'category', 'costToUnlock', 'costPerMinute'],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  costToUnlock: { type: Type.INTEGER },
                  costPerMinute: { type: Type.INTEGER },
                  isExternal: { type: Type.BOOLEAN, description: 'True if this is a new book to be generated/fetched.' }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint: Universal Knowledge Book Fetcher (Dynamic book generation)
app.post('/api/generate-book', async (req, res) => {
  try {
    const { title, author, currentLanguage, deepseekSettings } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Book Title is required' });
    }

    const generationPrompt = `Generate a high-fidelity mock book of "${title}" ${author ? `by ${author}` : ''} for our "All in One Library".
Language requested: ${currentLanguage || 'en'}.
Generate a book with:
1. Title and Author
2. A compelling, educational, or highly engaging Description
3. An appropriate Category
4. 3 distinct Chapters (each with a Title and at least 3-4 paragraphs of readable, high-quality, authentic-feeling text/chapters or complete summaries). Make the text rich and fully written out — no placeholders!
5. costToUnlock (a reasonable credits number, e.g., 30 to 60)
6. costPerMinute (a reasonable credits rate, e.g., 1 to 3)

Output format must be JSON conforming to the requested schema.`;

    if (deepseekSettings && deepseekSettings.useDeepSeek && deepseekSettings.apiKey) {
      try {
        console.log('Using DeepSeek for book generation...');
        const baseUrl = (deepseekSettings.baseUrl || 'https://api.deepseek.com').replace(/\/$/, '') + '/chat/completions';
        const model = deepseekSettings.model || 'deepseek-chat';

        const dsResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekSettings.apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: 'You are an elite literary scholar and book summarizer. Always output strictly valid JSON conforming to the requested schema.' },
              { role: 'user', content: generationPrompt }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (!dsResponse.ok) {
          const errText = await dsResponse.text();
          throw new Error(`DeepSeek API error during generation: ${dsResponse.status} ${errText}`);
        }

        const dsData: any = await dsResponse.json();
        const content = dsData.choices?.[0]?.message?.content || '{}';
        const bookData = JSON.parse(content);
        return res.json(bookData);
      } catch (dsError: any) {
        console.error('DeepSeek generation failed, falling back to Gemini:', dsError.message);
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: generationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'author', 'description', 'category', 'chapters', 'costToUnlock', 'costPerMinute'],
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            costToUnlock: { type: Type.INTEGER },
            costPerMinute: { type: Type.INTEGER },
            chapters: {
              type: Type.ARRAY,
              description: 'A list of 3 complete chapters.',
              items: {
                type: Type.OBJECT,
                required: ['id', 'title', 'content'],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text || '{}';
    const bookData = JSON.parse(jsonText);
    res.json(bookData);
  } catch (error: any) {
    console.error('Error in /api/generate-book:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint: AI-Powered Plant / Tree Identifier (20+ Names Exhaustive Search)
app.post('/api/identify-plant', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const parsed = parseBase64DataUri(image);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const imagePart = {
      inlineData: {
        mimeType: parsed.mimeType,
        data: parsed.data
      }
    };

    const prompt = `Analyze this plant, tree, flower, leaf, or botanical specimen image.
Identify it and extract exhaustive name details across multiple languages.
You MUST provide Sanskrit names, regional Telugu names, Hindi names, Tamil names, Kannada names, English names, and an exhaustive list of up to 15-20 other Indian local, traditional, regional, or historical names.
Also extract its description and medicinal uses in Telugu.
Return the result in strictly formatted JSON conforming to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [imagePart, { text: prompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: [
            'treeName', 'botanicalName', 'sanskritNames', 'teluguNames',
            'hindiNames', 'tamilNames', 'kannadaNames', 'englishNames',
            'otherNames', 'description', 'medicinalUses'
          ],
          properties: {
            treeName: { type: Type.STRING },
            botanicalName: { type: Type.STRING },
            sanskritNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            teluguNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            hindiNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            tamilNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            kannadaNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            englishNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            otherNames: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            medicinalUses: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text || '{}';
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error('Error in /api/identify-plant:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint: Codebase to PDF generator
app.get('/api/codebase-pdf', (req, res) => {
  const filesToRead = [
    'metadata.json',
    'package.json',
    'server.ts',
    'index.html',
    'src/main.tsx',
    'src/types.ts',
    'src/App.tsx',
    'src/index.css',
    'src/data/books.ts',
    'src/components/Splash.tsx',
    'src/components/Dashboard.tsx',
    'src/components/Reader.tsx',
    'src/components/AdminPanel.tsx',
    'src/components/BrahmastraUltraAgent.tsx',
    'src/components/FolderPanel.tsx',
    'src/components/LibraryModal.tsx',
    'src/components/PricingPanel.tsx',
    'src/components/PaymentModal.tsx',
    'src/components/WriterRegistrationModal.tsx'
  ];

  const filesData = [];

  for (const file of filesToRead) {
    try {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        filesData.push({
          name: file,
          content: content,
          sizeKB: sizeKB
        });
      }
    } catch (e: any) {
      console.error(`Error reading file ${file}:`, e.message);
    }
  }

  // Escape HTML helper inside the endpoint to keep it self-contained
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Generate HTML response
  const html = `
<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="UTF-8">
  <title>All in One Library V4 - Full Codebase Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    code, pre {
      font-family: 'Fira Code', monospace;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .print-page-break {
        page-break-before: always;
      }
      pre {
        white-space: pre-wrap !important;
        word-break: break-all !important;
        overflow: visible !important;
        max-height: none !important;
        background-color: #fafafa !important;
        border: 1px solid #e2e8f0 !important;
      }
      body {
        background-color: #ffffff !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
  <!-- Top Navigation & PDF Control Panel -->
  <header class="no-print bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between shadow-sm">
    <div class="flex items-center space-x-3">
      <div class="bg-emerald-600 text-white p-2 rounded-lg font-bold">PDF</div>
      <div>
        <h1 class="text-lg font-bold text-slate-900">All in One Library V4 (Remix .V20)</h1>
        <p class="text-xs text-slate-500">అడ్మిన్ గారి స్పెషల్ కోడ్‌బేస్ పిడిఎఫ్ జనరేటర్</p>
      </div>
    </div>
    
    <div class="flex items-center space-x-4">
      <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-sm hover:shadow">
        <span>🖨️ PDF గా ప్రింట్/సేవ్ చేయండి (Save as PDF)</span>
      </button>
    </div>
  </header>

  <div class="flex flex-1 flex-row">
    <!-- Left Navigation Sidebar for selection & rapid browsing -->
    <aside class="no-print w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto h-[calc(100vh-73px)] sticky top-[73px]">
      <div class="mb-6">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">ఇన్‌స్ట్రక్షన్స్ / Instructions</h2>
        <div class="text-xs text-slate-600 space-y-2 bg-amber-50 border border-amber-200 p-3 rounded-lg leading-relaxed">
          <p><strong>1.</strong> పైన ఉన్న <strong>"PDF గా ప్రింట్/సేవ్ చేయండి"</strong> బటన్ నొక్కండి.</p>
          <p><strong>2.</strong> ప్రింట్ ప్రివ్యూలో <strong>Destination</strong> ను <strong>"Save as PDF"</strong> అని సెలెక్ట్ చేయండి.</p>
          <p><strong>3.</strong> **More settings** లో <strong>Background graphics</strong> ను ఆన్ చేయండి (కోడ్ కలర్స్ కనిపించడానికి).</p>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">ఫైల్ సెలెక్షన్ / File Selector</h2>
          <button onclick="toggleAllFiles(true)" class="text-[10px] text-emerald-600 font-medium hover:underline">Select All</button>
        </div>
        
        <div class="space-y-2 text-sm max-h-[400px] overflow-y-auto pr-1">
          ${filesData.map((f, i) => `
            <label class="flex items-start space-x-2.5 p-1.5 hover:bg-slate-50 rounded cursor-pointer transition">
              <input type="checkbox" id="chk-${i}" checked onchange="toggleFileVisibility(${i})" class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4">
              <div class="text-xs font-medium text-slate-700 truncate w-full" title="${f.name}">
                ${f.name}
                <div class="text-[10px] text-slate-400 font-normal">${f.sizeKB} KB</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>
      
      <div class="text-[10px] text-slate-400 text-center mt-8 pt-4 border-t border-slate-100">
        © ${new Date().getFullYear()} All in One Library V4
      </div>
    </aside>

    <!-- Main Content Panel with Source Codes -->
    <main class="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto space-y-8">
      <div class="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 mb-2">అడ్మిన్ గారికి స్వాగతం! / Welcome Admin Garu!</h2>
        <p class="text-slate-600 text-sm leading-relaxed">
          మన అప్లికేషన్ యొక్క పూర్తి కోడ్‌బేస్ (అన్ని ప్రధాన బ్యాకెండ్ మరియు ఫ్రంటెండ్ ఫైళ్లు) ఇక్కడ ఒకే క్రమపద్ధతిలో సిద్ధంగా అమర్చబడింది. మీరు ఏయే ఫైళ్లను పిడిఎఫ్‌లో చేర్చాలనుకుంటున్నారో ఎడమ వైపు ప్యానెల్ లో టిక్ మార్క్ చేసి, ఆపై పైన ఉన్న బటన్ క్లిక్ చేసి నేరుగా PDF రూపంలో డౌన్‌లోడ్ చేసుకోవచ్చు.
        </p>
      </div>

      <!-- Code Containers -->
      <div class="space-y-12">
        ${filesData.map((f, i) => `
          <section id="file-sec-${i}" class="print-page-break bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <!-- File Header -->
            <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">CODE</span>
                <span class="font-bold text-slate-800 text-sm md:text-base">${f.name}</span>
              </div>
              <div class="text-xs font-medium text-slate-400">Size: ${f.sizeKB} KB</div>
            </div>
            
            <!-- Code Block with syntax styling -->
            <div class="p-6 bg-slate-900 text-slate-100 text-xs md:text-sm overflow-x-auto">
              <pre class="whitespace-pre overflow-x-auto leading-relaxed text-left text-slate-200 bg-slate-900" style="max-height: 800px; font-family: 'Fira Code', monospace;"><code class="block font-normal">${escapeHtml(f.content)}</code></pre>
            </div>
          </section>
        `).join('')}
      </div>
    </main>
  </div>

  <script>
    function toggleFileVisibility(index) {
      const isChecked = document.getElementById('chk-' + index).checked;
      const section = document.getElementById('file-sec-' + index);
      if (isChecked) {
        section.classList.remove('hidden');
        section.classList.add('print-page-break');
      } else {
        section.classList.add('hidden');
        section.classList.remove('print-page-break');
      }
    }

    function toggleAllFiles(status) {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb, index) => {
        cb.checked = status;
        toggleFileVisibility(index);
      });
    }
  </script>
</body>
</html>
  `;

  res.send(html);
});

// Setup Vite Dev Server / Static Asset pipeline
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
