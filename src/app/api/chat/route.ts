import { NextRequest, NextResponse } from "next/server";
import { Message, LangChainAdapter } from "ai";
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
    
    // Validate messages array with more robust checking
    const messages: Message[] = Array.isArray(body.messages) ? body.messages : [];
    
    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }
    
    const currentQuestion = messages[messages.length - 1].content;
    if (!currentQuestion?.trim()) {
      return NextResponse.json(
        { error: "Empty question provided" },
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
      temperature: 0.1,
      streaming: true,
    });
    
    const pc = await getPineconeClient();
    const vectorStore = await getVectorStore(pc);
    
    // Add debugging to see what processUserMessage returns
    console.log("About to call processUserMessage...");
    const stream = await processUserMessage({
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
      vectorStore,
      model,
    });
    
    console.log("Stream type:", typeof stream);
    console.log("Stream is array:", Array.isArray(stream));
    console.log("Stream prototype:", Object.getPrototypeOf(stream));
    
    if (!stream) {
      return NextResponse.json(
        { error: "No stream returned from processUserMessage" },
        { status: 500 }
      );
    }
    
    // Convert to response using LangChainAdapter
    return LangChainAdapter.toDataStreamResponse(stream);
    
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}