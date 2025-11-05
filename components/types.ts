export type MessageNode = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  children: MessageNode[];
};