'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import type { MessageNode } from './types';

type Props = {
  node: MessageNode;
  sessionId: string;
  onSend: (parentId: string, newNode: MessageNode) => void;
};

export default function ThreadNode({ node, sessionId, onSend }: Props) {
  const { messages, sendMessage } = useChat({ id: sessionId });
  const [input, setInput] = useState('');

    const handleSend = async () => {
      const text = input.trim();
      if (!text) return;
      setInput('');

      const userNode: MessageNode = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        children: [],
      };
      onSend(node.id, userNode);
      await sendMessage({ text }); // stays within same session
  };
  const lastHandledId = useRef<string | null>(null);

  const lastInitializedId = useRef<string | null>(null);

  useEffect(() => {
    if (
      node.role === 'user' &&
      messages.length === 0 &&
      lastInitializedId.current !== node.id
    ) {
      lastInitializedId.current = node.id;
      sendMessage({ text: node.text });
    }
  }, [node, messages.length, sendMessage]);

  // // Automatically send the root's initial user message when first mounted
  // useEffect(() => {

  //   if (node.role !== 'user' || hasInitialized.current) return;
  //   if (messages.length > 0) return;


  //   if (node.role === 'user' && messages.length === 0 && !hasInitialized.current) {
  //     hasInitialized.current = true;
  //     sendMessage({ text: node.text });
  //   }
  // }, [node.role, node.text, messages.length, sendMessage]);

  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    if (latest.id === lastHandledId.current) return;

    const lastPart = latest.parts?.[latest.parts.length - 1] as any;
    const textPart = latest.parts?.find((p: any) => p.type === 'text') as any;
    const text = textPart?.text?.trim() || '';

    // Only add when we’ve reached the final 'done' state of the assistant
    const isFinal =
      latest.role === 'assistant' &&
      (!lastPart?.state || lastPart.state === 'done') &&
      text.length > 0;

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
  }, [messages, node.id, onSend]);



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
          <ThreadNode
            key={child.id}
            node={child}
            sessionId={sessionId}
            onSend={onSend}
          />
        ))}
      </div>
    </div>
  );
}
