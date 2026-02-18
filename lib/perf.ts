import type { ProfilerOnRenderCallback } from "react";

type RenderCounts = Record<string, number>;

type ProfilerMetrics = {
  mounts: number;
  updates: number;
  nestedUpdates: number;
  commits: number;
  totalActualDuration: number;
  totalBaseDuration: number;
  maxActualDuration: number;
};

type ProfilerTable = Record<string, ProfilerMetrics>;

const renderCounts: RenderCounts = {};
const profilerTable: ProfilerTable = {};

const isDev = process.env.NODE_ENV === "development";

function ensureProfilerRow(id: string): ProfilerMetrics {
  if (!profilerTable[id]) {
    profilerTable[id] = {
      mounts: 0,
      updates: 0,
      nestedUpdates: 0,
      commits: 0,
      totalActualDuration: 0,
      totalBaseDuration: 0,
      maxActualDuration: 0,
    };
  }
  return profilerTable[id];
}

function roundMs(value: number): number {
  return Math.round(value * 100) / 100;
}

export function recordRenderCount(label: string): void {
  if (!isDev) {
    return;
  }

  renderCounts[label] = (renderCounts[label] ?? 0) + 1;
}

export const onProfilerRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration
) => {
  if (!isDev) {
    return;
  }

  const row = ensureProfilerRow(id);
  row.commits += 1;
  row.totalActualDuration += actualDuration;
  row.totalBaseDuration += baseDuration;
  row.maxActualDuration = Math.max(row.maxActualDuration, actualDuration);

  if (phase === "mount") {
    row.mounts += 1;
    return;
  }

  if (phase === "nested-update") {
    row.nestedUpdates += 1;
    return;
  }

  row.updates += 1;
};

export function resetPerfMetrics(): void {
  if (!isDev) {
    return;
  }

  Object.keys(renderCounts).forEach((key) => {
    delete renderCounts[key];
  });
  Object.keys(profilerTable).forEach((key) => {
    delete profilerTable[key];
  });
}

export function getPerfSnapshot(): {
  renderCounts: RenderCounts;
  profilerTable: ProfilerTable;
} {
  return {
    renderCounts: { ...renderCounts },
    profilerTable: Object.fromEntries(
      Object.entries(profilerTable).map(([key, value]) => [key, { ...value }])
    ),
  };
}

export function printPerfSummary(): void {
  if (!isDev) {
    console.log("[perf] summary is available in development mode only.");
    return;
  }

  const { renderCounts: counts, profilerTable: profiler } = getPerfSnapshot();
  const renderRows = Object.entries(counts)
    .map(([component, renders]) => ({
      component,
      renders,
    }))
    .sort((a, b) => b.renders - a.renders);

  const profilerRows = Object.entries(profiler)
    .map(([component, metrics]) => ({
      component,
      commits: metrics.commits,
      mounts: metrics.mounts,
      updates: metrics.updates,
      nestedUpdates: metrics.nestedUpdates,
      totalActualMs: roundMs(metrics.totalActualDuration),
      avgActualPerCommitMs: roundMs(
        metrics.commits === 0
          ? 0
          : metrics.totalActualDuration / metrics.commits
      ),
      maxActualMs: roundMs(metrics.maxActualDuration),
      totalBaseMs: roundMs(metrics.totalBaseDuration),
    }))
    .sort((a, b) => b.totalActualMs - a.totalActualMs);

  console.group("[perf] summary");
  if (renderRows.length === 0) {
    console.log("No render counts recorded.");
  } else {
    console.table(renderRows);
  }

  if (profilerRows.length === 0) {
    console.log("No profiler commits recorded.");
  } else {
    console.table(profilerRows);
  }
  console.groupEnd();
};

declare global {
  interface Window {
    __THREADLAB_PERF__?: {
      reset: () => void;
      print: () => void;
      snapshot: () => ReturnType<typeof getPerfSnapshot>;
    };
  }
}

if (typeof window !== "undefined" && isDev) {
  window.__THREADLAB_PERF__ = {
    reset: resetPerfMetrics,
    print: printPerfSummary,
    snapshot: getPerfSnapshot,
  };
}
