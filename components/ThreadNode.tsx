'use client';

import { useState } from 'react';
import { recordRenderCount } from '../lib/perf';
import PerfProfiler from './PerfProfiler';
import type { MessageNode } from './types';

type Props = {
  node: MessageNode;
  replyToNode: (parentId: string, text: string) => Promise<void>;
  loadingNodeId?: string | null;
};

export default function ThreadNode({ node, replyToNode, loadingNodeId }: Props) {
  const [input, setInput] = useState('');

  recordRenderCount("ThreadNode");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    replyToNode(node.id, input.trim());
    setInput('');
  };

  return (
    <PerfProfiler id="ThreadNode">
      <>
        <div
          className={
            `mb-2 rounded border p-2 ` +
            (node.role === 'user'
              ? 'border-blue-200 bg-blue-100 text-blue-900'
              : 'border-purple-200 bg-purple-100 text-purple-900')
          }
        >
          <PerfProfiler id="NodeText">
            <>
              <strong>{node.role === 'user' ? 'User' : 'AI'}:</strong> {node.text}
            </>
          </PerfProfiler>
        </div>

        {node.role === 'assistant' && (
          <>
            {loadingNodeId === node.id && (
              <div className="mt-2 mb-2 flex items-center gap-2 text-purple-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                <span className="text-sm text-purple-600">Thinking...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-4 mt-2 flex gap-2">
              <input
                className="flex-1 rounded border px-2 py-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply..."
                disabled={loadingNodeId === node.id}
              />
              <button
                className="rounded bg-purple-600 px-3 text-white disabled:opacity-50"
                disabled={loadingNodeId === node.id}
              >
                Send
              </button>
            </form>
          </>
        )}

        <div className="ml-4 border-l-2 border-purple-200 pl-4">
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
    </PerfProfiler>
  );
}
