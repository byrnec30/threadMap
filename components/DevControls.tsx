'use client';

import { printPerfSummary, resetPerfMetrics } from '../lib/perf';
import { useDevPerfStore } from '../store/DevPerfStore';

export default function DevControls() {
  const disableMemoization = useDevPerfStore((state) => state.disableMemoization);
  const toggleDisableMemoization = useDevPerfStore((state) => state.toggleDisableMemoization);

  return (
    <div className="z-50 rounded-lg border border-red-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            toggleDisableMemoization();
            resetPerfMetrics();
            console.log(`[perf] memoization ${!disableMemoization ? 'disabled' : 'enabled'}`);
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium text-white ${disableMemoization ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          Memo: {disableMemoization ? 'OFF' : 'ON'}
        </button>
        <button
          type="button"
          onClick={() => { resetPerfMetrics(); console.clear(); console.log('[perf] reset metrics'); }}
          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Reset Perf
        </button>
        <button
          type="button"
          onClick={() => { console.log(`[perf] memoization is ${disableMemoization ? 'disabled' : 'enabled'}`); printPerfSummary(); }}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Print Perf Summary
        </button>
      </div>
    </div>
  );
}
