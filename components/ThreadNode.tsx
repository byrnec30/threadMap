'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import type { MessageNode } from './types';

type Props = {
  node: MessageNode;
  onSend: (parentId: string, newNode: MessageNode) => void;
};

export default function ThreadNode({ node, onSend }: Props) {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat({
    id: node.id,
  });

const handleSend = async () => {
  if (!input.trim()) return;
  const userMessage = input.trim();
  setInput('');

  const userNode: MessageNode = {
    id: crypto.randomUUID(),
    role: 'user',
    text: userMessage,
    children: [],
  };
  onSend(node.id, userNode);
  await sendMessage({ text: userMessage });
};

const lastHandledId = useRef<string | null>(null);

useEffect(() => {
  if (messages.length === 0) return;
  const latest = messages[messages.length - 1];

  // Skip if we've already handled this message
  if (latest.id === lastHandledId.current) return;

  // Only act on completed assistant messages
  const lastPart = latest.parts?.[latest.parts.length - 1] as any;
  const textPart = latest.parts?.find((p) => p.type === 'text');
  const text = textPart?.text ?? '';

  const isFinal =
    latest.role === 'assistant' &&
    (!lastPart?.state || lastPart.state === 'done') &&
    text.trim().length > 0;

  if (isFinal) {
    const assistantNode: MessageNode = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text,
      children: [],
    };
    onSend(node.id, assistantNode);
    lastHandledId.current = latest.id;
    }
}, [messages]);

  return (
    <div className="ml-4 mt-2">
      <div className="p-2 rounded bg-purple-100 text-purple-900 mb-2">
        <strong>{node.role === 'user' ? 'User' : 'AI'}:</strong> {node.text}
      </div>

     {node.role === 'assistant' && <div className="flex gap-2 mb-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Reply..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white rounded px-3"
        >
          Send
        </button>
      </div>}

      <div className="ml-6 border-l-2 border-purple-200 pl-4">
        {node.children?.map((child) => (
          <ThreadNode key={child.id} node={child} onSend={onSend} />
        ))}
      </div>
    </div>
  );
}
