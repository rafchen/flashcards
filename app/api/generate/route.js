import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a card creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards": [
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

export async function POST(req) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const data = await req.text();

    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: data },
        ],
        response_format: "json"
    });

    const flashcards = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(flashcards.flashcards);
}
