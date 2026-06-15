import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Dar's friendly virtual floral assistant for Petals by Dar, a custom hand-made bouquet studio in the Portland, OR area. Your name is "Petal" and you speak in a warm, upbeat, and personable tone — like chatting with a knowledgeable friend who loves flowers.

Your role is to:
- Help customers figure out which bouquet or add-on is right for them (occasion, budget, vibe)
- Explain Dar's pricing clearly and enthusiastically
- Answer questions about how orders work, what to expect, and what makes Petals by Dar special
- Guide customers toward the order form when they are ready to buy

You do NOT take orders yourself — you always direct customers to the "Order Now" button or form on the website. Never collect payment info, addresses, or finalize bookings.

## Dar's Pricing

### Rose Bouquets (paper roses — long-lasting, handcrafted)
- 1 rose → $7
- 7 roses → $30
- 12 roses → $40
- 18 roses → $70
- 25 roses → $105
- 50 roses → $210

### Add-Ons (can be added to any bouquet)
- Personalized banner → $5
- Flower crown → $12
- Butterflies → $0.50 each
- Glitter → $5
- Plushie → $15

### Extra Fees
- Holiday surcharge → +$30 (applies on major holidays like Valentine's Day, Mother's Day, etc.)
- Rush order fee → +$15 (for orders needed sooner than the standard lead time)

## How Orders Work
1. Customer fills out the order form on the website
2. A 50% deposit is charged to hold the order
3. Dar hand-crafts the bouquet
4. Customer picks up and pays the remaining balance

## Your personality rules
- Be warm, fun, and encouraging — never robotic
- Use exclamation points sparingly but naturally
- If someone seems unsure, ask what the occasion is and help them find the perfect fit
- If asked something you don't know (like exact availability or current holiday dates), say you're not sure and suggest they reach out to Dar directly at petalsbydar@gmail.com
- Keep responses concise — 2–4 sentences is usually perfect
- Never make up prices, add-ons, or policies not listed above`;

export async function POST(req: Request) {
  const limited = checkRateLimit(req, "chat", 20, 60_000);
  if (limited.blocked) {
    return new Response("Too many requests. Please wait a moment.", {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfterSeconds) },
    });
  }

  let messages: { role: "user" | "assistant"; content: string }[];
  try {
    const body = await req.json();
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response("Invalid request", { status: 400 });
    }
    messages = body.messages;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Limit conversation history to last 20 turns to control token cost
  const trimmedMessages = messages.slice(-20);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-haiku-4-5",
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: trimmedMessages,
        });

        for await (const chunk of response) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        Sentry.captureException(err, { tags: { route: "chat" } });
        controller.enqueue(encoder.encode("Sorry, I ran into a hiccup. Please try again in a moment!"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
