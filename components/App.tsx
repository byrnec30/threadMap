'use client';
import { useEffect, useState } from 'react';
import ThreadPanel from './ThreadPanel';
import type { Thread } from './types';

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [globalInput, setGlobalInput] = useState('');

  const handleNewThread = () => {
    if (!globalInput.trim()) return;

    const newThread = { id: crypto.randomUUID(), text: globalInput.trim()}
    setThreads((prev) => [...prev, newThread]);
    setGlobalInput('');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-purple-50 p-6">
      <h1 className="text-2xl font-bold text-purple-900 mb-4">Thread Lab</h1>

      <div className="flex-1 overflow-y-auto">
        {threads.map(root => 
        <ThreadPanel id={root.id} key={root.id} prompt={root.text} />
        )}
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
