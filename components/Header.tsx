'use client';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-lg font-semibold text-purple-700">Chat Threads</h1>
      <div className="flex gap-2 text-sm text-gray-500">
        <button>Model: gpt-4</button>
        <button>Toggle Signals</button>
      </div>
    </header>
  );
}
