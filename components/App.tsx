'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import Header from './Header';
import ThreadTree from './ThreadTree';
import InputBar from './InputBar';
import SignalPanel from './SignalPanel';

export default function App() {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-purple-50">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 border-r border-gray-300 overflow-y-auto">
          <ThreadTree messages={messages} />
        </div>
        <div className="w-1/3">
          <SignalPanel />
        </div>
      </div>
      <InputBar
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSend={(text) => {
          sendMessage({ text });
          setInput('');
        }}
      />
    </div>
  );
}
