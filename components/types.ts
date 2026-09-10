export type MessageNode = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  children: string[];
  sessionId: string;
  parentId: string | null;
  isExpanded?: boolean;
};

export type Thread = {
  id: string;
  text: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};