'use client';
import ThreadTree from './ThreadTree';

type Props = {
  id: string;
  prompt: string;
};

export default function ThreadPanel({ id, prompt }: Props) {
    console.count("ThreadPanel render")

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <ThreadTree id={id} key={id}/>
    </div>
  );
}
