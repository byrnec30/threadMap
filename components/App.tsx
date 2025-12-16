'use client';
import { useState } from 'react';
import ThreadPanel from './ThreadPanel';
import { useThreadStore } from '../store/ThreadStore';

export default function App() {
  const [globalInput, setGlobalInput] = useState('');

  // store actions + state
  const createThread = useThreadStore((s) => s.createThread);
  const threads = useThreadStore((s) => s.threads);
  const nodes = useThreadStore((s) => s.nodes);

  const handleNewThread = () => {
    if (!globalInput.trim()) return;
    createThread(globalInput.trim());
    setGlobalInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-purple-50 p-6">
      <h1 className="text-2xl font-bold text-purple-900 mb-4">
        Thread Lab
      </h1>

      <div className="flex-1 overflow-y-auto space-y-4">
        {threads.map((rootId) => {
          const rootNode = nodes[rootId];
          if (!rootNode) return null;

          return (
            <ThreadPanel
              key={rootId}
              id={rootId}
              prompt={rootNode.text} // the initial text
            />
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-gray-800"
          placeholder="Start a new thread..."
          value={globalInput}
          onChange={(e) => setGlobalInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNewThread()}
        />

        <button
          onClick={handleNewThread}
          className="bg-purple-600 text-white rounded-lg px-4"
        >
          Send
        </button>
      </div>
    </div>
  );
}
