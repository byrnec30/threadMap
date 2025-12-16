'use client';
import { useEffect, useState, useRef } from 'react';
import ThreadNode from './ThreadNode';
import { useThreadStore } from '../store/ThreadStore';
import { be } from 'zod/locales';
import { a } from 'framer-motion/client';

export default function ThreadTree({ id, prompt }: { id: string; prompt: string }) {
  const storeSessions = useThreadStore((s) => s.sessions);
  const beginNewNode = useThreadStore((s) => s.beginNewNode);
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    runInitialAI();
  }, []);

 const runInitialAI = async () => {
    setLoadingNodeId(id);

    const aiText = await callAI(prompt);
    beginNewNode(id, aiText, 'assistant');

    setLoadingNodeId(null);
  };

  const replyToNode = async (parentId: string, text: string) => {
    setLoadingNodeId(parentId);

    const userId = beginNewNode(parentId, text, 'user');
    console.log("pink blue User ID of new node:", userId);

    const aiText = await callAI(text);

    beginNewNode(userId, aiText, 'assistant');

    setLoadingNodeId(null);

    console.log('pink blue Current sessions in store:', storeSessions);
  };


const callAI = async (prompt: string) => {
//   const sessionId = resolveSessionForNewChild(parentId);
// const messages = sessions[sessionId];
// streamText({ messages });
  try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      return data.text;
  } catch (err) {
    console.error("AI error:", err);
    throw err;
  }
};

  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-white">
      <ThreadNode id={id} replyToNode={replyToNode} loadingNodeId={loadingNodeId}/>
    </div>
  );
}
