import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omni Sahayak",
  description: "Intelligent customer support powered by AI",
  icons: {
    icon: "/bot-avatar.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <main className="min-h-screen bg-background">
          {children}
        </main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
