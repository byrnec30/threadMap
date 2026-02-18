'use client';
import ThreadTree from './ThreadTree';
import PerfProfiler from './PerfProfiler';
import { recordRenderCount } from '../lib/perf';

type Props = {
  id: string;
};


export default function ThreadPanel({ id }: Props) {
  recordRenderCount("ThreadPanel");

  return (
    <PerfProfiler id="ThreadPanel">
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <ThreadTree id={id} key={id}/>
      </div>
    </PerfProfiler>
  );
}
