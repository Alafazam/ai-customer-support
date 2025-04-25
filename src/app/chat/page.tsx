'use client';

import ChatBot from '@/components/ChatBot/ChatBot';
import Navbar from '@/components/Navbar/Navbar';

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-[100dvh] pt-16 flex items-center justify-center bg-background p-4">
        <ChatBot />
      </div>
    </>
  );
} 