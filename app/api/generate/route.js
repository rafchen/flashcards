import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a card creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information.
4. Use simple language to make the flashcards accessible to a wide range of learners.
5. Include a variety of question types, such as definitions, examples, comparisons, and applications.
6. Avoid overly complex or ambiguous phrasing in both questions and answers.
7. When appropriate, use mnemonics or memory aids to help reinforce the information.
8. Tailor the difficulty level of flashcards to the user's specific preferences.
9. If given a body of text, extract the most important and relevant information for the flashcard.
10. Aim to create a balanced set of flashcards that covers the topic comprehensively.
11. Only generate 10 flashcards.

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
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const data = await req.text();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: data },
            ]
        });

        const completionContent = completion.choices[0]?.message?.content;

        if (!completionContent) {
            return NextResponse.json({ error: 'Invalid response from OpenAI' }, { status: 500 });
        }

        let flashcards;
        try {
            flashcards = JSON.parse(completionContent);
        } catch (parseError) {
            return NextResponse.json({ error: 'Failed to parse JSON from OpenAI' }, { status: 500 });
        }

        if (!Array.isArray(flashcards.flashcards)) {
            return NextResponse.json({ error: 'Invalid flashcards format' }, { status: 500 });
        }

        return NextResponse.json(flashcards);
    } catch (error) {
        console.error("Error generating flashcards:", error);

        if (error.code === 'insufficient_quota') {
            return NextResponse.json({ error: 'Quota exceeded. Please check your plan and billing details.' }, { status: 429 });
        }

        return NextResponse.json({ error: 'An error occurred while generating flashcards.' }, { status: 500 });
    }
}
