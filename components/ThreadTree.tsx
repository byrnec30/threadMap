'use client';
import ThreadNode from './ThreadNode';

type Props = {
  messages: {
    id: string;
    role: string;
    parts: { type: string; text?: string }[];
  }[];
};

export default function ThreadTree({ messages }: Props) {
  return (
    <div className="p-4">
      <h2 className="mb-2 text-xl font-bold text-purple-800">Thread Tree</h2>
      {messages.map((m) => (
        <ThreadNode
          key={m.id}
          title={`${m.role === 'user' ? 'User' : 'AI'}: ${
            m.parts.find((p) => p.type === 'text')?.text || ''
          }`}
        />
      ))}
    </div>
  );
}
