'use client';
import ThreadTree from './ThreadTree';

type Props = {
  id: string;
};


export default function ThreadPanel({ id }: Props) {
    console.count(`ThreadPanel ${id} render`);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <ThreadTree id={id} key={id}/>
    </div>
  );
}
