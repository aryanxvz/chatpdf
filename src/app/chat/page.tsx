"use client";
import { Chat } from "@/components/sections/chat";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="relative flex min-h-full w-full items-center justify-center bg-white dark:bg-black">
      {/* Grid background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Main content container with max width */}
      <div className="w-full max-w-6xl 2xl:max-w-7xl px-6 md:px-8 relative">
        <div className="flex flex-1 py-16 z-10 relative w-full">
          <Chat />
        </div>

        <div className="absolute top-5 right-6 md:right-8 z-50">
          <Link href="/pinecone-records" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
            View Pinecone Records
          </Link>
        </div>
      </div>
    </div>
  );
}