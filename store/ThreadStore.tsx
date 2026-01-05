// store/threadStore.ts
import { create } from "zustand";
import type { MessageNode, Message } from "../components/types";

type ThreadState = {
  threads: string[];
  nodes: Record<string, MessageNode>;
  sessions: Record<string, Message[]>;

  createThread: (initialText: string) => string;
  createSessionFromMessages: (messages: Message[]) => string;
  buildSessionFromNode: (nodeId: string) => Message[];
  appendToSession: (sessionId: string, message: Message) => void;
  updateNodeText: (nodeId: string, text: string) => void;
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

export const useThreadStore = create<ThreadState>((set, get) => ({
  threads: [],
  nodes: {},
  sessions: {},

  createThread: (initialText) => {
    const rootId = crypto.randomUUID();
    const { createSessionFromMessages, appendToSession } = get();

    const sessionId = createSessionFromMessages([{
      role: "user",
      content: initialText}]);

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

  createSessionFromMessages: (messages: Message[]) => {
    const newSessionId = crypto.randomUUID();

    set((state) => {
      return {
        sessions: {
          ...state.sessions,
          [newSessionId]: [...messages],
        },
      };
    });
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
    if (!parentNode) throw new Error("Parent node not found");
    const hasDiverged = parentNode.children.length > 0;

    if (!hasDiverged) {
      return parentNode.sessionId;
    } else {
      const messages = buildSessionFromNode(parentId);
      return createSessionFromMessages(messages);
    }
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

      current = current.parentId
        ? nodes[current.parentId]
        : null;
    }
    return messages;
  },

  beginUserTurn(parentId: string, text: string) {
    const { addNode, resolveSessionForNewChild, appendToSession } = get();

    const resolvedSessionId = resolveSessionForNewChild(parentId);
    appendToSession(resolvedSessionId, { role: "user", content: text });
    const userNodeId = addNode(parentId, text, "user", resolvedSessionId);

    return { resolvedSessionId, userNodeId };
  },

  updateNodeText: (nodeId: string, text: string) => {
  set((state) => ({
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...state.nodes[nodeId],
        text,
      },
    },
  }));
},


  addNode: (parentId, text, role, sessionId) => {

    const id = crypto.randomUUID();

    set((state) => {
      const parent = state.nodes[parentId];
      if (!parent) return state;

      return {
        nodes: {
          ...state.nodes,
          [id]: {
            id,
            role,
            text,
            sessionId: sessionId,
            parentId: parentId,
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
      if (!node) return state;
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

}));
