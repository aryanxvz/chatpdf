import { Chat } from "@/components/sections/chat";

export default function Home() {
  return (
    <main>
      <div className="flex flex-1 py-12 px-12">
        <div className="w-full">
          <Chat />
        </div>
      </div>
    </main>
  );
}