type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function callAIStream(messages: Message[]) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to start AI stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  async function* stream() {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  }

  return stream();
}