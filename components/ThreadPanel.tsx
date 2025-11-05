'use client';
import ThreadTree from './ThreadTree';
import type { MessageNode } from './types';

type Props = {
  threads: MessageNode[];
  onSend: (parentId: string, newNode: MessageNode) => void;
};

export default function ThreadPanel({ threads, onSend }: Props) {
  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadTree key={thread.id} messages={[thread]} onSend={onSend} />
      ))}
    </div>
  );
}
