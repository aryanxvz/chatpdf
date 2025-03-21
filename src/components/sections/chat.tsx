"use client";
import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { useChat, Message } from "ai/react";
import { useEffect, useRef } from "react";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { ChatLine } from "./chat-bubble";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Chat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
    });

  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full dark:bg-neutral-900/80 dark:border-gray-400 dark:border dark:border-dotted dark:rounded-md bg-white/80 border border-gray-200 border-dotted rounded-md shadow-lg backdrop-blur-sm flex flex-col h-[70vh] 2xl:h-[75vh]">
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
          <>
            {messages.map(({ id, role, content }: Message, index) => (
              <ChatLine
                key={id}
                role={role}
                content={content}
                sources={[]}
              />
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleFormSubmit} className="flex clear-both">
          <Input
            value={input}
            placeholder="Type your question about the document..."
            onChange={handleInputChange}
            className="mr-2 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm"
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 group"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 group-hover:scale-110 transition-all duration-300" />
            )}
          </Button>
        </form>
        
        <div className="mt-4 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="text-sm group flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-all" />
              Try another PDF
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}