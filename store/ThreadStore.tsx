import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Message, MessageNode } from "../components/types";

type ThreadState = {
  threads: string[];
  nodes: Record<string, MessageNode>;
  sessions: Record<string, Message[]>;
  draftTextByNodeId: Record<string, string>;
  loadingNodeId: string | null;

  createThread: (initialText: string) => string;
  createSessionFromMessages: (messages: Message[]) => string;
  buildSessionFromNode: (nodeId: string) => Message[];
  appendToSession: (sessionId: string, message: Message) => void;
  updateDraftText: (nodeId: string, text: string) => void;
  commitDraftText: (nodeId: string) => void;
  clearDraftText: (nodeId: string) => void;
  setLoadingNodeId: (nodeId: string | null) => void;
  reset: () => void;
  beginUserTurn: (
    parentId: string,
    text: string
  ) => { resolvedSessionId: string; userNodeId: string };
  resolveSessionForNewChild: (parentId: string) => string;
  addNode: (
    parentId: string,
    text: string,
    role: "user" | "assistant",
    sessionId: string
  ) => string;
  toggleExpand: (id: string) => void;
};

export const useThreadStore = create<ThreadState>()(
  persist(
    (set, get) => ({
      threads: [],
      nodes: {},
      sessions: {},
      draftTextByNodeId: {},
      loadingNodeId: null,

      createThread: (initialText) => {
        const rootId = crypto.randomUUID();
        const { createSessionFromMessages } = get();

        const sessionId = createSessionFromMessages([
          { role: "user", content: initialText },
        ]);

        set((state) => ({
          threads: [...state.threads, rootId],
          nodes: {
            ...state.nodes,
            [rootId]: {
              id: rootId,
              role: "user",
              text: initialText,
              parentId: null,
              sessionId,
              children: [],
              isExpanded: true,
            },
          },
        }));

        return rootId;
      },

      reset: () => {
        set({
          threads: [],
          nodes: {},
          sessions: {},
          draftTextByNodeId: {},
          loadingNodeId: null,
        });

        localStorage.removeItem("threadmap-v1");
      },

      createSessionFromMessages: (messages: Message[]) => {
        const newSessionId = crypto.randomUUID();

        set((state) => ({
          sessions: {
            ...state.sessions,
            [newSessionId]: [...messages],
          },
        }));

        return newSessionId;
      },

      appendToSession: (sessionId: string, message: Message) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
        [sessionId]: [
          ...(state.sessions[sessionId] || []),
          message,
        ],
      },
    }));
  },

      resolveSessionForNewChild: (parentId: string) => {
        const { nodes, createSessionFromMessages, buildSessionFromNode } = get();
        const parentNode = nodes[parentId];
        if (!parentNode) {
          throw new Error("Parent node not found");
        }

        const hasDiverged = parentNode.children.length > 0;
        if (!hasDiverged) {
          return parentNode.sessionId;
        }

        const messages = buildSessionFromNode(parentId);
        return createSessionFromMessages(messages);
      },

      buildSessionFromNode: (nodeId: string) => {
        const { nodes } = get();
        const messages: Message[] = [];

        let current: MessageNode | null = nodes[nodeId] ?? null;
        while (current) {
          messages.unshift({
            role: current.role,
            content: current.text,
          });
          current = current.parentId ? nodes[current.parentId] : null;
        }
        return messages;
      },

      beginUserTurn(parentId: string, text: string) {
        const { addNode, appendToSession, resolveSessionForNewChild } = get();

        const resolvedSessionId = resolveSessionForNewChild(parentId);
        appendToSession(resolvedSessionId, { role: "user", content: text });
        const userNodeId = addNode(parentId, text, "user", resolvedSessionId);

        return { resolvedSessionId, userNodeId };
      },

      updateDraftText: (nodeId: string, text: string) => {
        set((state) => ({
          draftTextByNodeId: {
            ...state.draftTextByNodeId,
            [nodeId]: text,
          },
        }));
      },

      commitDraftText: (nodeId: string) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) {
            return state;
          }

          const committedText = state.draftTextByNodeId[nodeId] ?? node.text;
          const nextDraftTextByNodeId = { ...state.draftTextByNodeId };
          delete nextDraftTextByNodeId[nodeId];

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                text: committedText,
              },
            },
            sessions: {
              ...state.sessions,
              [node.sessionId]: [
                ...(state.sessions[node.sessionId] || []),
                { role: "assistant", content: committedText },
              ],
            },
            draftTextByNodeId: nextDraftTextByNodeId,
          };
        });
      },

      clearDraftText: (nodeId: string) => {
        set((state) => {
          if (!(nodeId in state.draftTextByNodeId)) {
            return state;
          }

          const nextDraftTextByNodeId = { ...state.draftTextByNodeId };
          delete nextDraftTextByNodeId[nodeId];

          return {
            draftTextByNodeId: nextDraftTextByNodeId,
          };
        });
      },

      setLoadingNodeId: (nodeId: string | null) => {
        set({
          loadingNodeId: nodeId,
        });
      },

      addNode: (parentId, text, role, sessionId) => {
        const id = crypto.randomUUID();

        set((state) => {
          const parent = state.nodes[parentId];
          if (!parent) {
            return state;
          }

          return {
            nodes: {
              ...state.nodes,
              [id]: {
                id,
                role,
                text,
                sessionId,
                parentId,
                children: [],
                isExpanded: true,
              },
              [parentId]: {
                ...parent,
                children: [...parent.children, id],
              },
            },
          };
        });

        return id;
      },

      toggleExpand: (id) =>
        set((state) => {
          const node = state.nodes[id];
          if (!node) {
            return state;
          }

          return {
            nodes: {
              ...state.nodes,
              [id]: {
                ...node,
                isExpanded: !node.isExpanded,
              },
            },
          };
        }),
    }),
    {
      name: "threadmap-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        nodes: state.nodes,
        sessions: state.sessions,
      }),
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          return persisted as ThreadState;
        }

        return persisted as ThreadState;
      },
    }
  )
);
