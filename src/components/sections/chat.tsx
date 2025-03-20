// chat.tsx:
"use client";
import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { useChat, Message } from "ai/react";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ChatLine } from "./chat-bubble";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
    });

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  return (
    <div className="w-full dark:bg-neutral-900/80 dark:border-gray-400 dark:border dark:border-dotted dark:rounded-md bg-white/80 border border-gray-200 border-dotted rounded-md shadow-lg backdrop-blur-sm flex flex-col h-[65vh] 2xl:h-[75vh]">
      <div 
        className="p-6 overflow-auto flex-1" 
        ref={containerRef}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-neutral-500">
              Start the conversation by asking a question about your PDF
            </p>
          </div>
        ) : (
          messages.map(({ id, role, content }: Message, index) => (
            <ChatLine
              key={id}
              role={role}
              content={content}
              sources={[]}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex clear-both">
          <Input
            value={input}
            placeholder="Type your question about the document..."
            onChange={handleInputChange}
            className="mr-2 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm"
          />

          {isLoading ? (
            <Button disabled className="w-24">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Wait
            </Button>
          ) : (
            <Button type="submit" className="w-24">
              Ask
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}