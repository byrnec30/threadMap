'use client';
import { useState } from 'react';
import NodeChildren from "./NodeChildren";
import NodeText from "./NodeText";
import { useThreadStore } from "../store/ThreadStore";

type Props = {
  id: string;
  replyToNode: (parentId: string, text: string) => Promise<void>;
};

export default function ThreadNode({ id, replyToNode }: Props) {
  const role = useThreadStore((s) => s.nodes[id]?.role);
  const isNodeLoading = useThreadStore((s) => s.loadingNodeId === id);
  const [input, setInput] = useState('');

  console.count(`ThreadNode ${id} render`);


  if (!role) return null;

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
            role === 'user'
            ? 'bg-blue-100 text-blue-900 border-blue-200'
            : 'bg-purple-100 text-purple-900 border-purple-200')
        }>
        <div className="flex items-center gap-2">
          <strong>{role === 'user' ? 'User' : 'AI'}:</strong>
        </div>


      <div className="prose prose-sm">
        <NodeText id={id} />
      </div>


      </div>

      {role === 'assistant' && (
        <>
        <form onSubmit={handleSubmit} className="mt-2 mb-4 flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply..."
            disabled={isNodeLoading}
          />
          <button
            className="bg-purple-600 text-white rounded px-3 disabled:opacity-50"
            disabled={isNodeLoading}
          >
            Send
          </button>
        </form>
        </>
      )}
      <NodeChildren
        id={id}
        replyToNode={replyToNode}
      />
    </>
  );
}
