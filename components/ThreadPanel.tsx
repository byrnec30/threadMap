'use client';

import { memo } from 'react';
import { recordRenderCount } from '../lib/perf';
import { useDevPerfStore } from '../store/DevPerfStore';
import PerfProfiler from './PerfProfiler';
import ThreadTree from './ThreadTree';

type Props = {
  id: string;
  prompt: string;
};

function ThreadPanel({ id, prompt }: Props) {
  recordRenderCount("ThreadPanel");

  return (
    <PerfProfiler id="ThreadPanel">
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <ThreadTree id={id} prompt={prompt} key={id} />
      </div>
    </PerfProfiler>
  );
}

function arePropsEqual(prev: Props, next: Props): boolean {
  if (useDevPerfStore.getState().disableMemoization) {
    return false;
  }

  return prev.id === next.id && prev.prompt === next.prompt;
}

export default memo(ThreadPanel, arePropsEqual);
