// page.tsx:
"use client";
import { Chat } from "@/components/sections/chat";
import { cn } from "@/lib/utils";

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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Chat Container */}
      <div className="flex flex-1 py-20 z-10 relative w-full max-w-6xl 2xl:max-w-7xl px-4 md:px-8">
        <Chat />
      </div>
    </div>
  );
}