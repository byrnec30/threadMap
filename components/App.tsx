'use client';
import { useState } from 'react';
import ThreadPanel from './ThreadPanel';
import type { MessageNode } from './types';


export default function App() {
  const [threads, setThreads] = useState<MessageNode[]>([]);
  const [globalInput, setGlobalInput] = useState('');

  const handleSend = (parentId: string, newNode: MessageNode) => {
    const addReply = (nodes: MessageNode[]): MessageNode[] =>
      nodes.map((n) =>
        n.id === parentId
          ? { ...n, children: [...(n.children || []), newNode] }
          : { ...n, children: addReply(n.children || []) }
      );
    setThreads((prev) => addReply(prev));
  };

  const handleNewThread = () => {
    if (!globalInput.trim()) return;
    const newThread: MessageNode = {
      id: crypto.randomUUID(),
      role: 'user',
      text: globalInput.trim(),
      children: [],
    };
    setThreads((prev) => [...prev, newThread]);
    setGlobalInput('');
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-purple-50 p-6">
      <h1 className="text-2xl font-bold text-purple-900 mb-4">Thread Lab</h1>

      <div className="flex-1 overflow-y-auto">
        <ThreadPanel threads={threads} onSend={handleSend} />
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
