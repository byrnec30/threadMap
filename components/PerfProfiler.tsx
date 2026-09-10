'use client';

import { Profiler, type ReactNode } from "react";
import { onProfilerRender } from "../lib/perf";

type Props = {
  id: string;
  children: ReactNode;
};

export default function PerfProfiler({ id, children }: Props) {
  if (process.env.NODE_ENV !== "development") {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onProfilerRender}>
      {children}
    </Profiler>
  );
}
