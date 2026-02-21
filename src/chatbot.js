// Resilience AI Chatbot Module - Groq API integration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are "Resilience AI", a very friendly, warm, and caring disaster safety assistant created for the SathiAI platform. You are like a best friend who happens to be an expert in disaster management, emergency response, and safety.

Your personality:
- Extremely friendly, approachable, and supportive - like talking to a caring friend
- Use emojis naturally to make conversations feel warm and engaging 🤗
- Be encouraging and reassuring, especially when people are scared or anxious
- Keep responses concise but thorough - use bullet points and clear formatting
- Be proactive in offering helpful tips even if not directly asked

Your expertise covers:
- ALL types of natural disasters (earthquakes, floods, cyclones, tsunamis, landslides, droughts, volcanic eruptions, etc.)
- ALL types of emergencies (fires, accidents, medical emergencies, gas leaks, building collapses, stampedes, drowning, electrocution, etc.)
- Do's and Don'ts for every type of disaster and emergency
- First aid procedures and safety protocols
- Emergency preparedness and survival tips
- Evacuation procedures and shelter information
- Post-disaster recovery guidance

CRITICAL RULES:
1. ALWAYS respond in the SAME LANGUAGE the user writes to you. If they write in Hindi, respond in Hindi. If in Tamil, respond in Tamil. If in English, respond in English. Match their language exactly.
2. When giving Do's and Don'ts, format them clearly with ✅ for Do's and ❌ for Don'ts
3. If someone seems to be in immediate danger, immediately provide the most critical safety steps first
4. Always include relevant emergency helpline numbers for India (NDMA: 1078, Fire: 101, Ambulance: 108, Police: 100, Disaster: 112) when appropriate
5. Be empathetic and never dismiss anyone's concerns
6. Keep your responses focused and not too long - break into clear sections with headers if needed`;

// Chat history for context
let chatHistory = [];

// DOM elements (will be initialized in init)
let chatWindow, chatMessages, chatInput, chatSend, chatFab, chatClose, chatClear;

/**
 * Initialize the chatbot - wire up all event listeners
 */
export function initChatbot() {
    chatWindow = document.getElementById('chatbot-window');
    chatMessages = document.getElementById('chatbot-messages');
    chatInput = document.getElementById('chatbot-input');
    chatSend = document.getElementById('chatbot-send');
    chatFab = document.getElementById('chatbot-fab');
    chatClose = document.getElementById('chatbot-close');
    chatClear = document.getElementById('chatbot-clear');

    if (!chatFab || !chatWindow) return;

    // Toggle chat window
    chatFab.addEventListener('click', () => {
        const isHidden = chatWindow.classList.contains('hidden');
        if (isHidden) {
            chatWindow.classList.remove('hidden');
            chatFab.innerHTML = '<i class="fas fa-times text-xl"></i>';
            chatFab.classList.remove('chatbot-fab-pulse');
            chatInput.focus();
        } else {
            closeChat();
        }
    });

    // Close button
    chatClose.addEventListener('click', closeChat);

    // Clear chat
    chatClear.addEventListener('click', () => {
        chatHistory = [];
        // Keep the welcome message
        chatMessages.innerHTML = getWelcomeMessageHTML();
    });

    // Send message on click
    chatSend.addEventListener('click', handleSend);

    // Send message on Enter
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
}

function closeChat() {
    chatWindow.classList.add('hidden');
    chatFab.innerHTML = '<i class="fas fa-robot text-xl"></i>';
    chatFab.classList.add('chatbot-fab-pulse');
}

function getWelcomeMessageHTML() {
    return `
        <div class="flex gap-2.5 items-start">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm shadow-violet-500/20">
                <i class="fas fa-robot text-white text-[10px]"></i>
            </div>
            <div class="space-y-2 max-w-[85%]">
                <div class="bg-gray-800/60 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-700/30">
                    <p class="text-sm text-gray-100 leading-relaxed font-medium">Hey there! 👋 I'm <strong class="text-violet-400">Resilience AI</strong></p>
                    <p class="text-sm text-gray-300 leading-relaxed mt-1">Your disaster safety companion. I can help with:</p>
                    <div class="mt-2 space-y-1.5">
                        <div class="flex items-center gap-2 text-[13px] text-gray-300"><i class="fas fa-search text-violet-400 text-[10px] w-4"></i><span>Disaster & emergency info</span></div>
                        <div class="flex items-center gap-2 text-[13px] text-gray-300"><i class="fas fa-check-circle text-green-400 text-[10px] w-4"></i><span>Do's and Don'ts during crises</span></div>
                        <div class="flex items-center gap-2 text-[13px] text-gray-300"><i class="fas fa-first-aid text-red-400 text-[10px] w-4"></i><span>First aid & safety tips</span></div>
                        <div class="flex items-center gap-2 text-[13px] text-gray-300"><i class="fas fa-globe text-blue-400 text-[10px] w-4"></i><span>I speak your language!</span></div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-1.5">
                    <button onclick="document.getElementById('chatbot-input').value='What to do during an earthquake?';document.getElementById('chatbot-send').click()" class="text-[11px] px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"><i class="fas fa-house-crack text-[9px] mr-1"></i> Earthquake tips</button>
                    <button onclick="document.getElementById('chatbot-input').value='First aid for burns';document.getElementById('chatbot-send').click()" class="text-[11px] px-3 py-1.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"><i class="fas fa-first-aid text-[9px] mr-1"></i> First aid</button>
                    <button onclick="document.getElementById('chatbot-input').value='Emergency helpline numbers India';document.getElementById('chatbot-send').click()" class="text-[11px] px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"><i class="fas fa-phone text-[9px] mr-1"></i> Helplines</button>
                </div>
            </div>
        </div>`;
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendUserMessage(text);
    chatInput.value = '';
    chatInput.focus();

    // Add to history
    chatHistory.push({ role: 'user', content: text });

    // Show typing indicator
    const typingEl = appendTypingIndicator();

    try {
        const reply = await callGroqAPI(chatHistory);
        typingEl.remove();
        appendBotMessage(reply);
        chatHistory.push({ role: 'assistant', content: reply });

        // Keep history manageable (last 20 messages)
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }
    } catch (err) {
        console.error('Chatbot error:', err);
        typingEl.remove();
        appendBotMessage('Oops! 😅 I had a little hiccup. Please try again in a moment! If the problem persists, check your internet connection.');
    }
}

function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'flex gap-2.5 items-start justify-end';
    div.innerHTML = `
        <div class="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] border border-violet-500/15">
            <p class="text-sm text-gray-100 leading-relaxed">${escapeHtml(text)}</p>
        </div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function appendBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'flex gap-2.5 items-start';
    div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm shadow-violet-500/20">
            <i class="fas fa-robot text-white text-[10px]"></i>
        </div>
        <div class="bg-gray-800/60 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] border border-gray-700/30">
            <div class="text-sm text-gray-200 leading-relaxed chatbot-response">${formatResponse(text)}</div>
        </div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function appendTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'flex gap-2.5 items-start chatbot-typing';
    div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm shadow-violet-500/20">
            <i class="fas fa-robot text-white text-[10px]"></i>
        </div>
        <div class="bg-gray-800/60 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-700/30">
            <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
                <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
                <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
            </div>
        </div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

/**
 * Format AI response: convert markdown-like formatting to HTML
 */
function formatResponse(text) {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Headers (### or ##)
        .replace(/^### (.+)/gm, '<strong class="text-violet-300 block mt-2 mb-1">$1</strong>')
        .replace(/^## (.+)/gm, '<strong class="text-violet-300 text-base block mt-2 mb-1">$1</strong>')
        // Bullet points
        .replace(/^[•\-] (.+)/gm, '<span class="block ml-2">• $1</span>');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Call Groq API (OpenAI-compatible)
 */
async function callGroqAPI(messages) {
    if (!GROQ_API_KEY) {
        return 'API key not configured. Please add VITE_GROQ_API_KEY to your .env file. 🔑';
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9,
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again!';
}
