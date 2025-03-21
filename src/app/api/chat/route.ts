import { NextRequest, NextResponse } from "next/server";
import { Message } from "ai";
import { LangChainAdapter } from "ai";
import { getVectorStore } from "@/lib/vector-store";
import { ChatOpenAI } from "@langchain/openai";
import { processUserMessage } from "@/lib/langchain";
import { getPineconeClient } from "@/lib/pinecone-client";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();

    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const messages: Message[] = body.messages;
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const currentQuestion = messages[messages.length - 1]?.content;

    if (typeof currentQuestion !== "string" || !currentQuestion.trim()) {
      return NextResponse.json(
        { error: "Invalid question format" },
        { status: 400 }
      );
    }

    // Format conversation history
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(
        (message) =>
          `${message.role === "user" ? "Human" : "Assistant"}: ${
            message.content
          }`
      )
      .join("\n");

    // Initialize model and vector store
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: true,
    });

    const pc = await getPineconeClient();
    const vectorStore = await getVectorStore(pc);

    console.log("processUserMessage input:", {
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
    });

    const stream = await processUserMessage({
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
      vectorStore,
      model,
    });

    console.log("message answer =>", stream);

    // Convert the stream using the new adapter
    const response = LangChainAdapter.toDataStreamResponse(stream);
    return response;
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
