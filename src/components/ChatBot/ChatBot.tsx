'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff } from 'lucide-react';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Message, ChatState } from '@/types/chat';
import { useConversation } from '@11labs/react';

interface ConversationProps {
  message: string;
  source: 'user' | 'ai';
}

const ChatBot: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    issueType: 'UNKNOWN',
    currentStep: 'INITIAL',
  });
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setError(null);
    },
    onMessage: (props: ConversationProps) => {
      console.log('Message:', props);
      if (props.message && props.source === 'ai') {
        addMessage(props.message, 'assistant');
      }
    },
    onError: (message: string) => {
      console.error('Error:', message);
      setError(message || 'An error occurred');
    },
  });

  const getSignedUrl = async () => {
    try {
      const response = await fetch('/api/get-signed-url');
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }
      const { signedUrl } = await response.json();
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  };

  const startVoiceChat = useCallback(async () => {
    try {
      setError(null);
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('ElevenLabs Agent ID is not configured');
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to get a signed URL first
      try {
        const signedUrl = await getSignedUrl();
        await conversation.startSession({ signedUrl });
      } catch {
        // If signed URL fails, fall back to direct agent ID
        console.log('Falling back to direct agent ID connection');
        await conversation.startSession({
          agentId,
          authorization: `Bearer ${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
        });
      }
    } catch (error: unknown) {
      console.error('Failed to start voice chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice chat');
    }
  }, [conversation]);

  const stopVoiceChat = useCallback(async () => {
    try {
      await conversation.endSession();
      setError(null);
    } catch (error: unknown) {
      console.error('Failed to stop voice chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop voice chat');
    }
  }, [conversation]);

  const generateUniqueId = () => {
    messageCountRef.current += 1;
    return `${Date.now()}-${messageCountRef.current}`;
  };

  const addMessage = async (content: string, type: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: generateUniqueId(),
      content,
      type,
      timestamp: new Date().toISOString(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const processUserInput = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputValue.trim()) return;

    await addMessage(inputValue, 'user');
    
    // Simple response for now
    const response = `I received your message: "${inputValue}"`;
    await addMessage(response, 'assistant');
    
    setInputValue('');
  };

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatState.messages]);

  return (
    <Card className="w-[400px] h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/bot-avatar.png" alt="Bot" />
            </Avatar>
            Support Assistant
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startVoiceChat}
              disabled={conversation.status === 'connected'}
              variant="outline"
            >
              Start Voice
            </Button>
            <Button
              onClick={stopVoiceChat}
              disabled={conversation.status !== 'connected'}
              variant="outline"
            >
              Stop Voice
            </Button>
          </div>
        </CardTitle>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full pr-4">
          <ScrollAreaPrimitive.Viewport ref={scrollViewportRef} className="h-full w-full">
            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                } mb-4`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </ScrollAreaPrimitive.Viewport>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="icon"
            className={conversation.status === 'connected' ? 'bg-red-100' : ''}
            disabled={conversation.status !== 'connected'}
          >
            {conversation.status === 'connected' ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && processUserInput()}
          />
          <Button onClick={() => processUserInput()}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatBot; 