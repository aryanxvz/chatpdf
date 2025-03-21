import { NextRequest, NextResponse } from "next/server";
import { Message } from "ai";
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
    const messages: Message[] = body.messages ?? [];

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
    
    // Get the streaming result from processUserMessage
    const stream = await processUserMessage({
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
      vectorStore,
      model,
    });
    
    // Create a standard web Response with the stream
    // This bypasses the LangChainAdapter which might be causing validation issues
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // For LangChain StringOutputParser stream
          for await (const chunk of stream) {
            // Create a proper SSE message
            const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
          // End the stream with a done message
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      },
    });
    
    // Return as a standard Response object
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}