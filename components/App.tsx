'use client';

import { useState } from 'react';
import DevControls from './DevControls';
import PerfProfiler from './PerfProfiler';
import ThreadPanel from './ThreadPanel';
import type { Thread } from './types';
import { recordRenderCount } from '../lib/perf';

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [globalInput, setGlobalInput] = useState('');

  recordRenderCount("App");

  const handleNewThread = () => {
    if (!globalInput.trim()) return;

    const newThread = { id: crypto.randomUUID(), text: globalInput.trim() };
    setThreads((prev) => [...prev, newThread]);
    setGlobalInput('');
  };

  const handleResetApp = () => {
    setThreads([]);
    setGlobalInput('');
  };

  return (
    <PerfProfiler id="App">
      <div className="flex flex-col min-h-screen bg-purple-50 p-6">
        <h1 className="mb-4 text-2xl font-bold text-purple-900">Thread Lab</h1>
        {process.env.NODE_ENV === "development" ? (
          <div className="mb-4">
            <DevControls onResetApp={handleResetApp} />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {threads.map((root) => (
            <ThreadPanel id={root.id} key={root.id} prompt={root.text} />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2 text-gray-800"
            placeholder="Start a new thread..."
            value={globalInput}
            onChange={(e) => setGlobalInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNewThread()}
          />
          <button
            onClick={handleNewThread}
            className="rounded-lg bg-purple-600 px-4 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </PerfProfiler>
  );
}
