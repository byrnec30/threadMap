'use client';
import { useState } from 'react';
import ReactMarkdown from "react-markdown";
import { useThreadStore } from "../store/ThreadStore";

type Props = {
  id: string;
  replyToNode: (parentId: string, text: string) => Promise<void>;
  loadingNodeId?: string | null;
};

export default function ThreadNode({ id, replyToNode, loadingNodeId }: Props) {
  const node = useThreadStore((s) => s.nodes[id]);
  const toggleExpand = useThreadStore((s) => s.toggleExpand);
  const [input, setInput] = useState('');

  if (!node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    replyToNode(id, input.trim());
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
        <div className="flex items-center gap-2">
          {node.children?.length > 0 && (
            <button
              onClick={() => toggleExpand(id)}
              className="text-xs text-purple-600"
            >
              {!node.isExpanded ? '▸' : '▾'}
            </button>
          )}

          <strong>{node.role === 'user' ? 'User' : 'AI'}:</strong>
        </div>

        <div className="prose prose-sm">
          <ReactMarkdown>{node.text}</ReactMarkdown>
        </div>
      </div>

      {node.role === 'assistant' && (
        <>
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

      {node.isExpanded && (
        <div className="ml-4 pl-4 border-l-2 border-purple-200">
          {node.children?.map((childId: string) => (
            <ThreadNode
              key={childId}
              id={childId}
              replyToNode={replyToNode}
              loadingNodeId={loadingNodeId}
            />
          ))}
        {loadingNodeId === node.id && (
        <div className="mt-2 mb-2 flex items-center gap-2 text-purple-700">
          <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
          <span className="text-sm text-purple-600">Thinking…</span>
        </div>
      )}
      </div>
      )}
    </>
  );
}