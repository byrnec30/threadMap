'use client';
import ThreadNode from './ThreadNode';
import type { MessageNode } from './types';

type Props = {
  root: MessageNode;
  onSend: (parentId: string, newNode: MessageNode) => void;
};

export default function ThreadTree({ root, onSend }: Props) {
  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-white">
      <ThreadNode node={root} onSend={onSend} sessionId={root.id} />
    </div>
  );
}
