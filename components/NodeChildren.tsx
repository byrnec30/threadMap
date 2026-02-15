'use client';

import { memo } from "react";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { useThreadStore } from "../store/ThreadStore";
import ThreadNode from "./ThreadNode";

type Props = {
  id: string;
  replyToNode: (parentId: string, text: string) => Promise<void>;
  loadingNodeId?: string | null;
};

const EMPTY_CHILDREN: string[] = [];

function NodeChildren({ id, replyToNode, loadingNodeId }: Props) {
  const { children, isExpanded } = useStoreWithEqualityFn(
    useThreadStore,
    (s) => ({
      children: s.nodes[id]?.children ?? EMPTY_CHILDREN,
      isExpanded: s.nodes[id]?.isExpanded ?? false,
    }),
    shallow
  );
  const toggleExpand = useThreadStore((s) => s.toggleExpand);

      console.count(`NodeChildren ${id} render`);


  return (
    <>
      {children.length > 0 && (
        <button
          onClick={() => toggleExpand(id)}
          className="text-xs text-purple-600"
        >
          {!isExpanded ? '▸' : '▾'}
        </button>
      )}

      {isExpanded && (
        <div className="ml-4 pl-4 border-l-2 border-purple-200">
          {children.map((childId: string) => (
            <ThreadNode
              key={childId}
              id={childId}
              replyToNode={replyToNode}
              loadingNodeId={loadingNodeId}
            />
          ))}
          {loadingNodeId === id && (
            <div className="mt-2 mb-2 flex items-center gap-2 text-purple-700">
              <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              <span className="text-sm text-purple-600">Thinking…</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default memo(NodeChildren);
