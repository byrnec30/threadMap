import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const { text } = await streamText({
    model: openai("gpt-4.1-mini"),
    prompt,
  });

  const full = await text;

  return Response.json({ text: full });
}
