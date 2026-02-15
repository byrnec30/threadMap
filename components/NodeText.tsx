'use client';

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { useThreadStore } from "../store/ThreadStore";

type Props = {
  id: string;
};

function NodeText({ id }: Props) {

  console.count(`NodeText ${id} render`);

  const draft = useThreadStore((s) => s.draftTextByNodeId[id]);
  const finalText = useThreadStore((s) => s.nodes[id]?.text);

  const displayText = draft ?? finalText;
  const isStreaming = draft != null;

  if (displayText == null) return null;

  if (isStreaming) {
    return <pre className="whitespace-pre-wrap">{displayText}</pre>;
  }



  return <ReactMarkdown>{displayText}</ReactMarkdown>;
}

export default memo(NodeText);
