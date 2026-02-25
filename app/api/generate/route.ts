import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const { text } = await streamText({
      model: openai("gpt-4.1-mini"),
      messages,
    });

    const full = await text;

    return Response.json({ text: full });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "generation failed" }),
      { status: 500 }
    );
  }
}