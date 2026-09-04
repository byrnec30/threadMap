'use client';

import { useEffect, useState, useRef } from 'react';
import { recordRenderCount } from '../lib/perf';
import PerfProfiler from './PerfProfiler';
import ThreadNode from './ThreadNode';
import type { MessageNode } from './types';

type Props = {
  id: string;
  prompt: string;
};

function insertChild(
  root: MessageNode,
  parentId: string,
  child: MessageNode
): MessageNode {
  if (root.id === parentId) {
    return {
      ...root,
      children: [...root.children, child],
    };
  }

  return {
    ...root,
    children: root.children.map(c =>
      insertChild(c, parentId, child)
    ),
  };
}

async function callAI(prompt: string) {
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
}

export default function ThreadTree({ id, prompt }: Props) {
  const [tree, setTree] = useState(() => {
    const newRootNode: MessageNode = {
      id,
      sessionId: crypto.randomUUID(),
      role: 'user',
      text: prompt,
      children: [],
    };

    return newRootNode;
  });
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const effectRanRef = useRef(false);

  recordRenderCount("ThreadTree");

  useEffect(() => {
    if (effectRanRef.current) return;
    effectRanRef.current = true;

    const runInitialResponse = async () => {
      const aiResult = await callAI(tree.text);
      const assistantText = aiResult;

      const newAssistantNode: MessageNode = {
        id: crypto.randomUUID(),
        sessionId: crypto.randomUUID(),
        role: 'assistant',
        text: assistantText,
        children: [],
      };

      setTree(prev => insertChild(prev, tree.id, newAssistantNode));
      setLoadingNodeId(null);
    };

    void runInitialResponse();
  }, [tree]);

  useEffect(() => {
    console.log('pink blue, thread tree rendered, loadingNodeId:', loadingNodeId);
  }, [loadingNodeId]);

  const replyToNode = async (nodeId: string, text: string) => {
    setLoadingNodeId(nodeId);
    const newUserNode: MessageNode = {
      id: crypto.randomUUID(),
      sessionId: crypto.randomUUID(),
      role: 'user',
      text,
      children: [],
    };
    setTree(prev => insertChild(prev, nodeId, newUserNode));

    const aiResult = await callAI(text);
    const assistantText = aiResult; 

    const newAssistantNode: MessageNode = {
      id: crypto.randomUUID(),
      sessionId: crypto.randomUUID(),
      role: 'assistant',
      text: assistantText,
      children: [],
    };

    setTree(prev => insertChild(prev, newUserNode.id, newAssistantNode));
    setLoadingNodeId(null);
  };

  return (
    <PerfProfiler id="ThreadTree">
      <div className="rounded-lg border border-purple-200 bg-white p-4">
        <ThreadNode
          node={tree}
          replyToNode={replyToNode}
          loadingNodeId={loadingNodeId}
        />
      </div>
    </PerfProfiler>
  );
}
