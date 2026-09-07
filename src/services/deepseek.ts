// Brahmastra 3.5 DeepSeek Ultra Coding Engine

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

const DEFAULT_DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

export async function sendDeepSeekChat(
  messages: DeepSeekMessage[],
  options: DeepSeekCompletionOptions = {}
): Promise<string> {
  const apiKey = options.apiKey || localStorage.getItem('deepseek_api_key') || DEFAULT_DEEPSEEK_KEY;
  const model = options.model || localStorage.getItem('deepseek_model') || 'deepseek-chat';

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 4096,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    return 'ప్రతిస్పందన రాలేదు (No response generated from DeepSeek).';
  } catch (error: any) {
    console.error('DeepSeek execution error:', error);
    throw error;
  }
}
