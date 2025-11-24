export type MessageNode = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  children: MessageNode[];
  sessionId: string;
};

export type Thread = {
  id: string;
  text: string;
};