'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '@/lib/hooks/useChatStream';

const TOOL_LABELS: Record<string, string> = {
  search_leads: 'Searching leads',
  get_lead: 'Loading lead',
  get_pipeline_summary: 'Loading pipeline',
  bulk_update_lead_status: 'Updating leads',
  create_task: 'Creating task',
  create_reminder: 'Creating reminder',
};

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Tool call badges — only on assistant messages */}
      {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex flex-col gap-1 w-full">
          {message.toolCalls.map((tc, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-[var(--surface-2)] text-[var(--muted)] w-fit"
            >
              {tc.status === 'running' ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  {TOOL_LABELS[tc.name] ?? tc.name}...
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  {TOOL_LABELS[tc.name] ?? tc.name} done
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message bubble */}
      {(message.content || isUser) && (
        <div
          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words ${
            isUser
              ? 'bg-[var(--accent)] text-white rounded-br-sm whitespace-pre-wrap'
              : 'bg-[var(--surface-2)] text-[var(--fg)] rounded-bl-sm'
          }`}
        >
          {!message.content ? (
            <span className="flex gap-1 items-center h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
          ) : isUser ? (
            message.content
          ) : (
            <div className="chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
