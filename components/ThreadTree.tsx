'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { callAIStream } from '../lib/callAIStream';
import { recordRenderCount } from '../lib/perf';
import { useThreadStore } from '../store/ThreadStore';
import PerfProfiler from './PerfProfiler';
import ThreadNode from './ThreadNode';

export default function ThreadTree({ id }: { id: string }) {
  const beginUserTurn = useThreadStore((state) => state.beginUserTurn);
  const updateNodeText = useThreadStore((state) => state.updateNodeText);
  const addNode = useThreadStore((state) => state.addNode);
  const appendToSession = useThreadStore((state) => state.appendToSession);
  const rootNode = useThreadStore((state) => state.nodes[id]);
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const hasRun = useRef(false);

  recordRenderCount('ThreadTree');

  const runAssistantTurn = useCallback(async ({ parentNodeId, sessionId }: { parentNodeId: string; sessionId: string }) => {
    const messages = [...(useThreadStore.getState().sessions[sessionId] ?? [])];
    const assistantNodeId = addNode(parentNodeId, '', 'assistant', sessionId);
    let fullText = '';

    const stream = await callAIStream(messages);
    for await (const chunk of stream) {
      fullText += chunk;
      updateNodeText(assistantNodeId, fullText);
    }
    appendToSession(sessionId, { role: 'assistant', content: fullText });
  }, [addNode, appendToSession, updateNodeText]);

  useEffect(() => {
    if (hasRun.current || !rootNode) return;
    hasRun.current = true;
    if (rootNode.children.length > 0) return;

    const runInitialResponse = async () => {
      setLoadingNodeId(id);
      try {
        await runAssistantTurn({ parentNodeId: id, sessionId: rootNode.sessionId });
      } catch (error) {
        console.error('AI error:', error);
      } finally {
        setLoadingNodeId(null);
      }
    };

    void runInitialResponse();
  }, [id, rootNode, runAssistantTurn]);

  const replyToNode = async (parentId: string, text: string) => {
    setLoadingNodeId(parentId);
    try {
      const { resolvedSessionId, userNodeId } = beginUserTurn(parentId, text);
      await runAssistantTurn({ parentNodeId: userNodeId, sessionId: resolvedSessionId });
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setLoadingNodeId(null);
    }
  };

  return (
    <PerfProfiler id="ThreadTree">
      <div className="rounded-lg border border-purple-200 bg-white p-4">
        <ThreadNode id={id} replyToNode={replyToNode} loadingNodeId={loadingNodeId} />
      </div>
    </PerfProfiler>
  );
}
