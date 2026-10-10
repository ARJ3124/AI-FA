import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import {
  Sparkles, Send, Bot, User, Trash2, Lightbulb,
  RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle2,
  ChevronDown
} from 'lucide-react';

const API_BASE = '/api';
const HEALTH_CHECK_INTERVAL_MS = 30_000; // re-check every 30s
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// ── Types ──────────────────────────────────────────────────────────
type BackendStatus = 'checking' | 'online' | 'offline' | 'needs_login';

interface AIAssistantPageProps {
  accessToken: string | null;
}

// ── Welcome message ────────────────────────────────────────────────
const WELCOME_MESSAGE: ChatMessage = {
  id: 'm-welcome',
  sender: 'ai',
  text: 'Namaste! 👋 I am your **FinFlow AI Financial Assistant**.\n\nI can help you with:\n- Analyzing your spending patterns\n- Budget optimization tips\n- Saving strategies for India (UPI, Swiggy, etc.)\n- Investment basics (SIPs, PPF, etc.)\n- Financial goal planning\n\nHow can I assist you today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    'Analyze my food expenses',
    'Am I exceeding my budget?',
    'How can I save ₹5,000 this month?',
    'Explain the 50-30-20 rule',
  ],
};

// ── Local storage helpers ──────────────────────────────────────────
const STORAGE_KEY = 'finflow_ai_messages';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [WELCOME_MESSAGE];
}

function persistMessages(msgs: ChatMessage[]): void {
  try {
    // Keep last 100 messages to avoid storage bloat
    const trimmed = msgs.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

// ── Sleep helper ────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ── Markdown-like renderer (simple, no dependency) ─────────────────
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold **text**
    const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Headers ### and ##
    if (line.startsWith('### ')) {
      return (
        <p key={i} className="font-bold text-white text-sm mt-2 mb-1"
          dangerouslySetInnerHTML={{ __html: boldProcessed.replace('### ', '') }} />
      );
    }
    if (line.startsWith('## ')) {
      return (
        <p key={i} className="font-bold text-white mb-1"
          dangerouslySetInnerHTML={{ __html: boldProcessed.replace('## ', '') }} />
      );
    }
    // Bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <li key={i} className="ml-4 list-disc"
          dangerouslySetInnerHTML={{ __html: boldProcessed.replace(/^[-•]\s/, '') }} />
      );
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={i} className="ml-4 list-decimal"
          dangerouslySetInnerHTML={{ __html: boldProcessed }} />
      );
    }
    // Table header row (| col | col |)
    if (line.startsWith('|') && line.endsWith('|') && !line.startsWith('|---')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      return (
        <div key={i} className="flex text-xs font-semibold border-b border-slate-700 py-1 gap-2">
          {cells.map((c, ci) => (
            <span key={ci} className="flex-1 text-slate-200" dangerouslySetInnerHTML={{ __html: c.trim() }} />
          ))}
        </div>
      );
    }
    // Table separator
    if (line.startsWith('|---') || line.startsWith('| ---')) return null;
    // Empty line → spacer
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    // Default paragraph
    return (
      <p key={i} dangerouslySetInnerHTML={{ __html: boldProcessed }} />
    );
  });
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ accessToken }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [error, setError] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const healthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Scroll logic ─────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    setShowScrollButton(false);
  }, []);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollButton(distFromBottom > 80);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ── Backend health check ─────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Poll every 30s to detect if server comes online
    healthTimerRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS);
    return () => {
      if (healthTimerRef.current) clearInterval(healthTimerRef.current);
    };
  }, [checkHealth]);

  // ── Message persistence ───────────────────────────────────────────
  const updateMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    persistMessages(msgs);
  };

  // ── Send handler ─────────────────────────────────────────────────
  const handleSend = useCallback(async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isTyping) return;

    if (query.length > 2000) {
      setError('Message too long. Please keep it under 2,000 characters.');
      return;
    }

    setError('');
    setRateLimitMsg('');

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const withUser = [...messages, userMsg];
    updateMessages(withUser);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // ── Attempt backend call with retries (uses effective token for demo/local mode) ──
    const effectiveToken = accessToken || 'demo-token-123';
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);

      try {
        const res = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify({
            message: query,
            conversation_id: conversationId ?? undefined,
          }),
          signal: AbortSignal.timeout(30_000), // 30s timeout
        });

        // Mark backend online on first successful contact
        setBackendStatus('online');

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          const msg = data.detail ?? 'Rate limit reached. Please wait a moment before sending more messages.';
          setRateLimitMsg(msg);
          setIsTyping(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.conversation_id) setConversationId(data.conversation_id);

        const aiReply: ChatMessage = {
          id: `m-${Date.now() + 1}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: data.suggestions ?? [],
        };

        updateMessages([...withUser, aiReply]);
        setIsTyping(false);
        return; // Success — exit retry loop

      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt + 1} failed, retrying...`, err);
        }
      }
    }

    // All retries exhausted — use intelligent local fallback
    console.warn(`Backend unavailable after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
    setBackendStatus('offline');
    const fallback = generateLocalFallback(query);
    updateMessages([...withUser, fallback]);

    setIsTyping(false);
    inputRef.current?.focus();
  }, [messages, input, isTyping, accessToken, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    const fresh = [WELCOME_MESSAGE];
    updateMessages(fresh);
    setConversationId(null);
    setRateLimitMsg('');
    setError('');
  };

  const handleRetryHealth = () => {
    setBackendStatus('checking');
    checkHealth();
  };

  // ── Status badge ─────────────────────────────────────────────────
  const StatusBadge = () => {
    if (backendStatus === 'checking') {
      return (
        <span className="flex items-center space-x-1.5 text-slate-400 text-xs">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Connecting to AI backend...</span>
        </span>
      );
    }
    if (backendStatus === 'online') {
      return (
        <span className="flex items-center space-x-1.5 text-emerald-400 text-xs">
          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <Wifi className="h-3 w-3" />
          <span>Connected to secure AI backend</span>
        </span>
      );
    }
    if (backendStatus === 'needs_login') {
      return (
        <span className="flex items-center space-x-1.5 text-indigo-400 text-xs">
          <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" />
          <span>Backend online — sign in to enable personalized AI</span>
        </span>
      );
    }
    return (
      <button
        onClick={handleRetryHealth}
        className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 text-xs transition-colors group"
        title="Click to retry connection"
      >
        <WifiOff className="h-3 w-3" />
        <span>Offline mode — using built-in AI advisor</span>
        <RefreshCw className="h-3 w-3 group-hover:animate-spin" />
      </button>
    );
  };

  const suggestedPrompts = [
    'Analyze my food expenses',
    'Am I exceeding my budget?',
    'How can I save ₹5,000 this month?',
    'Predict my end-of-month expenses',
    'Explain the 50-30-20 rule',
    'Tips to invest in India',
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 relative">
            <Sparkles className="h-6 w-6" />
            {backendStatus === 'online' && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">AI Financial Assistant</h1>
            <StatusBadge />
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center space-x-1.5"
          title="Clear Chat History"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Offline notice banner */}
      {backendStatus === 'offline' && (
        <div className="flex items-start space-x-3 p-4 bg-amber-500/8 border border-amber-500/25 rounded-2xl text-sm">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-300 font-semibold text-sm">Running in built-in advisor mode</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              The FastAPI backend isn't reachable. Start it with{' '}
              <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">
                uvicorn main:app --reload
              </code>{' '}
              in the <code className="text-amber-300 font-mono text-xs">finflow-backend/</code> folder
              for full AI capability. The built-in advisor still provides excellent financial guidance!
            </p>
          </div>
          <button
            onClick={handleRetryHealth}
            className="shrink-0 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Rate limit warning */}
      {rateLimitMsg && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm flex items-center space-x-2.5">
          <span className="text-lg">⏱</span>
          <span>{rateLimitMsg}</span>
        </div>
      )}

      {/* Generic error */}
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Suggested prompt chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold flex items-center shrink-0">
          <Lightbulb className="h-3.5 w-3.5 text-amber-400 mr-1" /> Try:
        </span>
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isTyping}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 text-xs font-medium shrink-0 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col overflow-hidden relative"
        style={{ height: 'min(580px, 65vh)' }}>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-5 space-y-5"
          onScroll={handleScroll}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} onSuggestionClick={handleSend} isTyping={isTyping} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2 shadow-md">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <span className="text-xs text-slate-400 ml-1">
                  {backendStatus === 'online' ? 'AI is thinking...' : 'Analyzing your question...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-4 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center transition-all animate-fadeIn z-10"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-800/80 p-4 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  backendStatus === 'online'
                    ? 'Ask AI about your spending, budgets, or financial goals...'
                    : 'Ask your personal finance question...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={2000}
                disabled={isTyping}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3 pr-14 text-sm text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-60"
              />
              {input.length > 1800 && (
                <span className="absolute right-3 bottom-3 text-[10px] text-amber-400 font-medium">
                  {2000 - input.length} left
                </span>
              )}
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center shrink-0 group"
              title="Send message (Enter)"
            >
              {isTyping ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>

          {/* Footer status */}
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-slate-600">
              {backendStatus === 'online'
                ? '🔒 Secured · Conversation stored privately'
                : '💡 Built-in financial advisor · No data sent externally'}
            </span>
            <span className="text-[10px] text-slate-600">
              {messages.length - 1} message{messages.length !== 2 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Capability info */}
      {backendStatus !== 'online' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🍽️', title: 'Food & Dining', desc: 'Tips on Swiggy, Zomato & grocery spend' },
            { icon: '📊', title: 'Budget Rules', desc: '50-30-20 rule & category budgeting' },
            { icon: '💡', title: 'India Finance', desc: 'SIPs, PPF, UPI spend analysis & more' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Message Bubble Component ──────────────────────────────────────────
interface MessageBubbleProps {
  msg: ChatMessage;
  onSuggestionClick: (text: string) => void;
  isTyping: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, onSuggestionClick, isTyping }) => {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
          isUser
            ? 'bg-indigo-600'
            : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{msg.text}</div>
          ) : (
            <div className="space-y-0.5 leading-relaxed">
              {renderMarkdown(msg.text)}
            </div>
          )}

          <span
            className={`block text-[10px] mt-2 ${
              isUser ? 'text-indigo-200 text-right' : 'text-slate-500'
            }`}
          >
            {isUser ? '' : <CheckCircle2 className="h-2.5 w-2.5 inline mr-1 text-slate-600" />}
            {msg.timestamp}
          </span>
        </div>

        {/* Suggestion chips */}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => onSuggestionClick(sug)}
                disabled={isTyping}
                className="text-xs bg-slate-900 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-200 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-indigo-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sug} →
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Local fallback AI (runs when backend is unreachable) ─────────────
function generateLocalFallback(query: string): ChatMessage {
  const lower = query.toLowerCase();
  let text = '';
  let suggestions: string[] = [];

  if (any(lower, ['food', 'swiggy', 'zomato', 'dining', 'eat', 'restaurant'])) {
    text = '### 🍽️ Food & Dining Expense Tips\n\nDining out is typically the **#1 budget leak** in India. Here\'s what to do:\n\n- **Limit delivery orders** to 2–3 times per week max\n- **Meal prep on weekends** — cook 3–4 meals to avoid ordering on weeknights\n- **Use subscription plans:** Swiggy One / Zomato Gold saves ₹300–₹500/month\n- **Small UPI orders add up:** Even ₹150 coffee orders = ₹4,500/month if daily\n- **Grocery apps** (BigBasket, Blinkit) are 15–20% cheaper than ordering food\n\n**Potential savings: ₹3,000–₹6,000/month** just from smarter food choices!';
    suggestions = ['Am I exceeding my budget?', 'How can I save ₹5,000?', 'Explain the 50-30-20 rule'];

  } else if (any(lower, ['budget', 'exceed', 'limit', 'over', '50', '30', '20', 'rule'])) {
    text = '### 📊 The 50-30-20 Budgeting Rule\n\nA proven framework for Indian salaries:\n\n- **50% → Needs:** Rent, groceries, electricity, commute, EMIs\n- **30% → Wants:** Dining, OTT subscriptions, shopping, trips\n- **20% → Savings:** Emergency fund, SIPs, PPF, debt repayment\n\n**Pro tip:** Auto-transfer 20% to savings on **salary day** before spending anything. You won\'t miss what you don\'t see!\n\n**Example on ₹60,000/month:**\n- Needs: ₹30,000\n- Wants: ₹18,000\n- Savings: ₹12,000';
    suggestions = ['How can I save ₹5,000?', 'Analyze my food expenses', 'Tips to invest in India'];

  } else if (any(lower, ['save', 'saving', '5000', '₹5', 'cut', 'reduce'])) {
    text = '### 💡 How to Save ₹5,000 This Month\n\n5 proven tactics for India:\n\n1. **Reduce food delivery** → Cook at home 3 extra days → **Saves ₹1,500–₹2,000**\n2. **Pause one OTT** (Netflix ₹649, Prime ₹299) → **Saves ₹300–₹650**\n3. **Use public transport/carpool** instead of cabs → **Saves ₹800–₹1,500**\n4. **48-hour rule for online shopping** → Pause before buying → **Saves ₹1,000+**\n5. **Audit unused subscriptions** (gym, apps, cloud storage) → **Saves ₹300–₹500**\n\n**Total potential: ₹4,000–₹7,000/month** 🎯';
    suggestions = ['Analyze my food expenses', 'Am I exceeding my budget?', 'How to build an emergency fund'];

  } else if (any(lower, ['predict', 'forecast', 'end of month', 'next month'])) {
    text = '### 🤖 Expense Forecasting\n\nA simple way to predict your month-end spending:\n\n**Quick formula:**\n- Current spend ÷ Days elapsed × Total days in month\n- Add a **15% buffer** for unexpected expenses\n\n**Warning signs you\'ll overspend:**\n- Already at 60%+ of budget before the 20th\n- Weekend spending is 2× your weekday average\n- Festival season or travel planned\n\n**Action:** Check your **Analytics** tab in FinFlow for the daily spending trend chart!';
    suggestions = ['Am I exceeding my budget?', 'How can I save ₹5,000?', 'Explain the 50-30-20 rule'];

  } else if (any(lower, ['invest', 'sip', 'mutual fund', 'stock', 'ppf', 'fd', 'nps'])) {
    text = '### 📈 Investment Basics for India\n\n**Priority order for beginners:**\n\n1. ✅ **Emergency fund first** — 3–6 months of expenses in liquid FD or liquid mutual fund\n2. ✅ **Clear high-interest debt** — Credit card debt at 36–42% p.a. is toxic\n3. ✅ **Start a SIP** — ₹1,000/month in a Nifty 50 index fund beats savings account returns\n4. ✅ **Tax saving (80C)** — ELSS funds, PPF, or NPS before March 31st\n\n**Good starting funds:** Nifty 50 Index Funds, Parag Parikh Flexi Cap\n\n*This is general education, not financial advice. Consult a SEBI-registered advisor.*';
    suggestions = ['What is an emergency fund?', 'Difference between SIP and FD', 'How to start with ₹1,000'];

  } else {
    text = '### 🤖 FinFlow Financial Advisor\n\nHere\'s a quick financial health check based on your question:\n\n**Immediate actions:**\n- 📊 Check **Analytics** → see your top spending categories this month\n- 🎯 Visit **Budget** → set monthly caps for each category with alerts\n- 💳 Log all transactions, especially small UPI payments\n\n**Monthly checklist:**\n- ✅ Emergency fund: 3+ months of expenses saved?\n- ✅ No credit card debt rolling over month-to-month?\n- ✅ Saving at least 20% of monthly income?\n\nAsk me about: food expenses, the 50-30-20 rule, saving strategies, investment basics, or any spending category!';
    suggestions = ['Analyze my food expenses', 'Am I exceeding my budget?', 'How can I save ₹5,000?'];
  }

  return {
    id: `m-local-${Date.now()}`,
    sender: 'ai',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions,
  };
}

function any(str: string, keywords: string[]): boolean {
  return keywords.some(k => str.includes(k));
}
