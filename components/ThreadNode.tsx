'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { recordRenderCount } from '../lib/perf';
import { useThreadStore } from '../store/ThreadStore';
import PerfProfiler from './PerfProfiler';

type Props = {
  id: string;
  replyToNode: (parentId: string, text: string) => Promise<void>;
  loadingNodeId?: string | null;
};

export default function ThreadNode({ id, replyToNode, loadingNodeId }: Props) {
  const node = useThreadStore((state) => state.nodes[id]);
  const toggleExpand = useThreadStore((state) => state.toggleExpand);
  const [input, setInput] = useState('');

  recordRenderCount('ThreadNode');
  if (!node) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const reply = input.trim();
    if (!reply) return;
    void replyToNode(node.id, reply);
    setInput('');
  };

  return (
    <PerfProfiler id="ThreadNode">
      <>
        <div className={`mb-2 rounded border p-2 ${node.role === 'user' ? 'border-blue-200 bg-blue-100 text-blue-900' : 'border-purple-200 bg-purple-100 text-purple-900'}`}>
          <div className="flex items-center gap-2">
            {node.children.length > 0 && (
              <button type="button" onClick={() => toggleExpand(id)} className="text-xs text-purple-600" aria-label={node.isExpanded ? 'Collapse replies' : 'Expand replies'}>
                {node.isExpanded ? '▾' : '▸'}
              </button>
            )}
            <strong>{node.role === 'user' ? 'User' : 'AI'}:</strong>
          </div>
          <PerfProfiler id="NodeText">
            <div className="prose prose-sm"><ReactMarkdown>{node.text}</ReactMarkdown></div>
          </PerfProfiler>
        </div>

        {node.role === 'assistant' && (
          <form onSubmit={handleSubmit} className="mb-4 mt-2 flex gap-2">
            <input
              className="flex-1 rounded border px-2 py-1"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Reply..."
              disabled={loadingNodeId === node.id}
            />
            <button className="rounded bg-purple-600 px-3 text-white disabled:opacity-50" disabled={loadingNodeId === node.id}>
              Send
            </button>
          </form>
        )}

        {node.isExpanded && (
          <div className="ml-4 border-l-2 border-purple-200 pl-4">
            {node.children.map((childId) => (
              <ThreadNode key={childId} id={childId} replyToNode={replyToNode} loadingNodeId={loadingNodeId} />
            ))}
            {loadingNodeId === node.id && (
              <div className="mb-2 mt-2 flex items-center gap-2 text-purple-700">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                <span className="text-sm text-purple-600">Thinking…</span>
              </div>
            )}
          </div>
        )}
      </>
    </PerfProfiler>
  );
}
