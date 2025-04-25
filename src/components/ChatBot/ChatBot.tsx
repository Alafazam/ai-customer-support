'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ChatState } from '@/types/chat';
import { useConversation } from '@11labs/react';
import { cn } from "@/lib/utils";
import { SendIcon } from '@/components/icons/SendIcon';

interface ConversationProps {
  message: string;
  source: 'user' | 'ai';
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
}

export default function ChatBot() {
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

  const getElevenLabsConfig = async () => {
    try {
      const response = await fetch('/api/elevenlabs-config');
      if (!response.ok) {
        throw new Error('Failed to get ElevenLabs configuration');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting ElevenLabs config:', error);
      throw error;
    }
  };

  const startVoiceChat = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error('Please allow microphone access to use voice chat');
      }

      // Get configuration from server
      const config = await getElevenLabsConfig();
      
      if (!config.agentId || !config.apiKey) {
        throw new Error('Voice chat is not configured. Please contact support.');
      }

      // Try signed URL first
      try {
        const signedUrl = await getSignedUrl();
        await conversation.startSession({ signedUrl });
        console.log('Connected using signed URL');
      } catch (signedUrlError) {
        console.log('Falling back to direct connection', signedUrlError);
        // Fall back to direct connection
        try {
          // Remove any URL encoding from the agent ID
          const cleanAgentId = decodeURIComponent(config.agentId);
          
          // Connect without any authorization prefix
          await conversation.startSession({
            agentId: cleanAgentId,
            authorization: config.apiKey
          });
        } catch (directError) {
          if (directError instanceof Error && directError.message.includes('daily limit')) {
            throw new Error('The AI agent has reached its daily limit. Please try again tomorrow.');
          }
          console.error('Direct connection failed:', directError);
          throw directError;
        }
      }
    } catch (error: unknown) {
      console.error('Failed to start voice chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice chat. Please try again.');
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
    <Card className="w-[440px] h-[600px] grid grid-rows-[auto,1fr,auto]">
      <CardHeader className="space-y-2">
        <div className="flex justify-center">
          <Button
            onClick={conversation.status === 'connected' ? stopVoiceChat : startVoiceChat}
            variant="ghost"
            size="icon"
            className="relative w-24 h-24 rounded-full hover:bg-transparent"
          >
            {/* Base circle with ping animation when active */}
            <div className={cn(
              "absolute inset-0 rounded-full",
              conversation.status === 'connected' ? "bg-primary/10 animate-ping" : "bg-muted"
            )} />
            
            {/* Middle circle with pulse animation when active */}
            <div className={cn(
              "absolute inset-4 rounded-full",
              conversation.status === 'connected' ? "bg-primary/20 animate-pulse" : "bg-muted/50"
            )} />
            
            {/* Microphone icon */}
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "w-12 h-12 transition-colors duration-200",
                  conversation.status === 'connected' ? "text-primary animate-pulse" : "text-muted-foreground"
                )}
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              
              {/* Sound wave circles when active */}
              {conversation.status === 'connected' && (
                <>
                  <div className="absolute -right-4 top-1/2 w-2 h-2 bg-primary rounded-full animate-soundwave1" />
                  <div className="absolute -left-4 top-1/2 w-2 h-2 bg-primary rounded-full animate-soundwave2" />
                  <div className="absolute top-1/2 -translate-y-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-soundwave3" />
                  <div className="absolute top-1/2 translate-y-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-soundwave4" />
                </>
              )}
            </div>
          </Button>
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center mt-2 px-4 break-words max-w-full">
            {error}
          </p>
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
          className="flex w-full gap-3 items-center"
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
              "h-10 w-10 rounded-full shrink-0",
              inputValue.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/90"
            )}
            disabled={!inputValue.trim()}
          >
            <SendIcon className={cn(
              "h-5 w-5 text-black",
              inputValue.trim() && "translate-x-0.5 -translate-y-0.5"
            )} />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 