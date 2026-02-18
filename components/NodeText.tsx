'use client';

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { useThreadStore } from "../store/ThreadStore";
import { useDevPerfStore } from "../store/DevPerfStore";
import PerfProfiler from "./PerfProfiler";
import { recordRenderCount } from "../lib/perf";

type Props = {
  id: string;
};

function NodeText({ id }: Props) {

  recordRenderCount("NodeText");

  const draft = useThreadStore((s) => s.draftTextByNodeId[id]);
  const finalText = useThreadStore((s) => s.nodes[id]?.text);

  const displayText = draft ?? finalText;
  const isStreaming = draft != null;

  if (displayText == null) return null;

  if (isStreaming) {
    return (
      <PerfProfiler id="NodeText">
        <pre className="whitespace-pre-wrap">{displayText}</pre>
      </PerfProfiler>
    );
  }



  return (
    <PerfProfiler id="NodeText">
      <ReactMarkdown>{displayText}</ReactMarkdown>
    </PerfProfiler>
  );
}

function arePropsEqual(prev: Props, next: Props): boolean {
  if (useDevPerfStore.getState().disableMemoization) {
    return false;
  }

  return prev.id === next.id;
}

export default memo(NodeText, arePropsEqual);
