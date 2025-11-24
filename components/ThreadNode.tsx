'use client';
import { useState } from 'react';
import type { MessageNode } from './types';

type Props = {
  node: MessageNode;
  replyToNode: (parentId: string, text: string) => Promise<void>;
  loadingNodeId?: string | null;
};

export default function ThreadNode({ node, replyToNode, loadingNodeId }: Props) {
  const [input, setInput] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    replyToNode(node.id, input.trim());
    setInput('');
  };

    return (
    <>
      <div className={
          `p-2 rounded mb-2 border ` + (
            node.role === 'user'
            ? 'bg-blue-100 text-blue-900 border-blue-200'
            : 'bg-purple-100 text-purple-900 border-purple-200')
        }>
        <strong>{node.role === 'user' ? 'User' : 'AI'}:</strong> {node.text}
      </div>

      {node.role === 'assistant' && (

        <>

        {/* {loadingNodeId === node.id && ( */}
                  {loadingNodeId === node.id && (

          <div className="mt-2 mb-2 flex items-center gap-2 text-purple-700">
            <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <span className="text-sm text-purple-600">Thinking…</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 mb-4 flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply..."
            disabled={loadingNodeId === node.id}
          />
          <button
            className="bg-purple-600 text-white rounded px-3 disabled:opacity-50"
            disabled={loadingNodeId === node.id}
          >
            Send
          </button>
        </form>
        </>
      )}

      <div className="ml-4 pl-4 border-l-2 border-purple-200">
        {node.children.map((child) => (
          <ThreadNode
            key={child.id}
            node={child}
            replyToNode={replyToNode}
            loadingNodeId={loadingNodeId}
          />
        ))}
      </div>
    </>
  );
}