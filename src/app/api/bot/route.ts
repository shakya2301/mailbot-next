import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { directoryScanner, mailSender, fetchAndParseEmails } from "@/lib/tools";

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // Corrected API key variable
  baseURL: "https://api.groq.com/openai/v1",
});

// Tools Dictionary
const tools = {
  mailSender: mailSender,
  directoryScanner: directoryScanner,
  mailReader: fetchAndParseEmails,
};
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(response.choices[0].message.content));
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
