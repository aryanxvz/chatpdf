// chat.tsx:
"use client";
import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { useChat, Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { ChatLine } from "./chat-bubble";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export function Chat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
    });
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, showSkeleton]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setShowSkeleton(true);
      handleSubmit(e);
      // Since handleSubmit doesn't return a Promise, we'll use isLoading state instead
    }
  };

  // Watch for changes in isLoading to hide skeleton
  useEffect(() => {
    if (!isLoading && showSkeleton) {
      setShowSkeleton(false);
    }
  }, [isLoading, showSkeleton]);

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
            
            {showSkeleton && (
              <div className="flex items-start mb-4">
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            )}
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
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <div className="mt-4 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="text-sm flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Try another PDF
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}