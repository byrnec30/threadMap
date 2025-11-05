'use client';
import ThreadNode from './ThreadNode';
import type { MessageNode } from './types';

type Props = {
  messages: MessageNode[];
  onSend: (parentId: string, newNode: MessageNode) => void;
};

export default function ThreadTree({ messages, onSend }: Props) {
  return (
    <div className="p-4">
      <h2 className="mb-2 text-xl font-bold text-purple-800">Thread Tree</h2>
      {messages.map((node) => (
        <ThreadNode key={node.id} node={node} onSend={onSend} />
      ))}
    </div>
  );
}
