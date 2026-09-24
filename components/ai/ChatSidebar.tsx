'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles, Trash2 } from 'lucide-react';
import { useChatStream } from '@/lib/hooks/useChatStream';
import ChatMessage from './ChatMessage';

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clear } = useChatStream();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <div
        className={`fixed bottom-6 right-6 z-40 p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-lg transition-all ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open AI assistant"
        >
          <Sparkles size={18} />
        </button>
      </div>

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-96 bg-[var(--surface)] border-l border-[var(--border)] shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--fg)]">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clear}
                className="p-1.5 rounded interactive icon-btn"
                title="Clear conversation"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded interactive icon-btn"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center text-[var(--muted)]">
              <Sparkles size={32} className="opacity-30" />
              <div>
                <p className="text-sm font-medium">Ask me anything about your leads</p>
                <p className="text-xs mt-1 opacity-70">
                  Try: &ldquo;Show me new leads this week&rdquo; or &ldquo;How&apos;s my pipeline?&rdquo;
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 focus-within:border-[var(--accent)] transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your leads..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none max-h-32 overflow-y-auto leading-5"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-1.5 rounded-lg bg-[var(--accent)] text-white disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Backdrop (mobile/overlay) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
