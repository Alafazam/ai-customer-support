import ChatBot from '@/components/ChatBot/ChatBot';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="relative flex place-items-center">
        <ChatBot />
      </div>
    </main>
  );
}
