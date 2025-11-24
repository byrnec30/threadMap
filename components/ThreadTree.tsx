'use client';
import { useEffect, useState, useRef } from 'react';
import ThreadNode from './ThreadNode';
import type { MessageNode } from './types';

type Props = {
  id: string;
  prompt: string;
};

export default function ThreadTree({ id, prompt }: Props) {

  const [tree, setTree] = useState(() => {
      const newRootNode: MessageNode = {
        id: id,
        sessionId: crypto.randomUUID(),
        role: 'user',
        text: prompt,
        children: [],
      };
    return newRootNode;
    });
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  const effectRanRef = useRef(false);

  useEffect(() => {
    if (effectRanRef.current) return;
    effectRanRef.current = true;

    setFirstAIResponse(tree);
  }, []);

    useEffect(() => { 
    console.log('pink blue, thread tree rendered, loadingNodeId:', loadingNodeId);
  }, [loadingNodeId]);

  const setFirstAIResponse = async (initialRoot: MessageNode) => {

    const aiResult = await callAI(initialRoot.text)
    const assistantText = aiResult;

    const newAssistantNode: MessageNode = {
      id: crypto.randomUUID(),
      sessionId: crypto.randomUUID(),
      role: 'assistant',
      text: assistantText,
      children: [],
  }
    setTree(prev => insertChild(prev, initialRoot.id, newAssistantNode));
    setLoadingNodeId(null);
}

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

  }

  const findNode = (root: MessageNode, nodeId: string): MessageNode | null => {
    if (root.id === nodeId) return root;

    for (const child of root.children) {
      const result = findNode(child, nodeId);
      if (result) return result;
    }

    return null;
  };

  function insertChild(root: MessageNode, parentId: string, child: MessageNode): MessageNode {
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

const callAI = async (prompt: string) => {
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
      <ThreadNode node={tree} replyToNode={replyToNode} loadingNodeId={loadingNodeId}/>
    </div>
  );
}
