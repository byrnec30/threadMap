'use client';

import { useState } from 'react';
import { recordRenderCount } from '../lib/perf';
import { useThreadStore } from '../store/ThreadStore';
import DevControls from './DevControls';
import PerfProfiler from './PerfProfiler';
import ThreadPanel from './ThreadPanel';

export default function App() {
  const [globalInput, setGlobalInput] = useState('');
  const createThread = useThreadStore((state) => state.createThread);
  const threads = useThreadStore((state) => state.threads);
  const nodes = useThreadStore((state) => state.nodes);

  recordRenderCount('App');

  const handleNewThread = () => {
    const prompt = globalInput.trim();
    if (!prompt) return;
    createThread(prompt);
    setGlobalInput('');
  };

  return (
    <PerfProfiler id="App">
      <div className="flex min-h-screen flex-col bg-purple-50 p-6">
        <h1 className="mb-4 text-2xl font-bold text-purple-900">Thread Lab</h1>
        {process.env.NODE_ENV === 'development' ? (
          <div className="mb-4"><DevControls /></div>
        ) : null}

        <div className="flex-1 space-y-4 overflow-y-auto">
          {threads.map((rootId) => {
            const rootNode = nodes[rootId];
            if (!rootNode) return null;
            return <ThreadPanel key={rootId} id={rootId} prompt={rootNode.text} />;
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-2 text-gray-800"
            placeholder="Start a new thread..."
            value={globalInput}
            onChange={(event) => setGlobalInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleNewThread()}
          />
          <button type="button" onClick={handleNewThread} className="rounded-lg bg-purple-600 px-4 text-white">
            Send
          </button>
        </div>
      </div>
    </PerfProfiler>
  );
}
