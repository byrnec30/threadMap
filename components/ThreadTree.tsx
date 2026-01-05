'use client';
import { useEffect, useState, useRef } from 'react';
import ThreadNode from './ThreadNode';
import { useThreadStore } from '../store/ThreadStore';
import type { Message } from "../components/types";
import { log } from 'console';

export default function ThreadTree({ id }: { id: string;}) {
  const storeSessions = useThreadStore((s) => s.sessions);
  const beginUserTurn = useThreadStore((s) => s.beginUserTurn);
  const updateNodeText = useThreadStore((s) => s.updateNodeText);
  const addNode = useThreadStore((s) => s.addNode);
  const appendToSession = useThreadStore((s) => s.appendToSession);
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    runInitialAI();
  }, []);

const runInitialAI = async () => {
  setLoadingNodeId(id);

  const rootNode = useThreadStore.getState().nodes[id];
  const sessionId = rootNode.sessionId;

  await runAssistantTurn({
    parentNodeId: id,
    sessionId,
  });

  setLoadingNodeId(null);
};

const replyToNode = async (parentId: string, text: string) => {
  setLoadingNodeId(parentId);

  const { resolvedSessionId, userNodeId } =
    beginUserTurn(parentId, text);

  await runAssistantTurn({
    parentNodeId: userNodeId,
    sessionId: resolvedSessionId,
  });

  setLoadingNodeId(null);
};

const runAssistantTurn = async ({
  parentNodeId,
  sessionId,
}: {
  parentNodeId: string;
  sessionId: string;
}) => {
  const messages = [...useThreadStore.getState().sessions[sessionId]];

  const assistantNodeId = addNode(
    parentNodeId,
    "",
    "assistant",
    sessionId
  );

  let fullText = "";

  const stream = await callAIStream(messages);

  for await (const chunk of stream) {
    fullText += chunk;
    updateNodeText(assistantNodeId, fullText);
  }

  appendToSession(sessionId, {
    role: "assistant",
    content: fullText,
  });

  logSession("After assistant turn:", sessionId);
};

const logSession = (label: string, sessionId: string) => {
  console.log('pink', label, sessionId,
    useThreadStore.getState().sessions
  );
};


const callAIStream = async (messages: Message[]) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start AI stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  async function* stream() {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      yield decoder.decode(value, { stream: true });
    }
  }

  return stream(); // AsyncIterable<string>
};


  // const callAI = async (messages: Message[]) => {
  //   try {
  //     const res = await fetch('/api/generate', {
  //       method: 'POST',
  //       body: JSON.stringify({ messages }),
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     const data = await res.json();
  //     return data.text;
  //   } catch (err) {
  //     console.error("AI error:", err);
  //     throw err;
  //   }
  // };



  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-white">
      <ThreadNode id={id} replyToNode={replyToNode} loadingNodeId={loadingNodeId}/>
    </div>
  );
}
