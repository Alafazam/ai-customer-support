'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Message, ChatState } from '@/types/chat';
import { useConversation } from '@11labs/react';
import { cn } from "@/lib/utils";
import { SpeakingIcon } from '@/components/icons/SpeakingIcon';
import { SendIcon } from '@/components/icons/SendIcon';

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
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!agentId || !apiKey) {
        throw new Error('ElevenLabs credentials are not configured');
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to get a signed URL first
      try {
        const signedUrl = await getSignedUrl();
        await conversation.startSession({ signedUrl });
      } catch {
        // If signed URL fails, fall back to direct connection
        console.log('Falling back to direct connection');
        await conversation.startSession({
          agentId,
          authorization: apiKey // Use the API key directly
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/bot-avatar.png" alt="Omni Sahayak" />
            </Avatar>
            <span>Omni Sahayak</span>
          </div>
          <Button
            onClick={conversation.status === 'connected' ? stopVoiceChat : startVoiceChat}
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full transition-all duration-200 hover:bg-secondary",
              conversation.status === 'connected' && "bg-primary/10 text-primary"
            )}
          >
            <SpeakingIcon isActive={conversation.status === 'connected'} />
          </Button>
        </CardTitle>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea 
          className="h-full pr-4" 
          type={chatState.messages.length > 0 ? "always" : "scroll"}
        >
          <ScrollAreaPrimitive.Viewport ref={scrollViewportRef} className="h-full w-full">
            {chatState.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-6 rounded-lg bg-secondary/50 backdrop-blur-sm shadow-inner">
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    I am your Omni Sahayak
                  </h3>
                  <p className="text-muted-foreground">
                    How may I help you today?
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {chatState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] break-words ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollAreaPrimitive.Viewport>
          {chatState.messages.length > 0 && (
            <ScrollAreaPrimitive.Scrollbar
              className="w-2 rounded-full bg-gray-100"
              orientation="vertical"
            >
              <ScrollAreaPrimitive.Thumb className="rounded-full bg-gray-300" />
            </ScrollAreaPrimitive.Scrollbar>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <form 
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            processUserInput();
          }}
        >
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processUserInput();
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-colors",
              inputValue.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/90"
            )}
            disabled={!inputValue.trim()}
          >
            <SendIcon className={cn(
              "transition-transform",
              inputValue.trim() && "translate-x-0.5 -translate-y-0.5"
            )} />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatBot; 