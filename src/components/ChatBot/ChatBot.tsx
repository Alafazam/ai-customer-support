'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatState, Attachment } from '@/types/chat';
import { useConversation } from '@11labs/react';
import { cn } from "@/lib/utils";
import { Paperclip, X, PhoneCall, PhoneOff } from 'lucide-react';
import { AIAgentIcon } from '@/components/icons/AIAgentIcon';

// Define types for ElevenLabs messages
interface ElevenLabsMessage {
  message?: string;
  text?: string;
  source: 'ai' | 'user';
}

export default function ChatBot() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    issueType: 'UNKNOWN',
    currentStep: 'INITIAL',
  });
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setError(null);
      setIsListening(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setError(null);
      setIsListening(false);
    },
    onMessage: (message: ElevenLabsMessage) => {
      console.log('Message:', message);
      if (message.source === 'ai') {
        const content = message.message || message.text;
        if (content) {
          addMessage(content, 'assistant');
        }
      }
    },
    onError: (message: string) => {
      console.error('Error:', message);
      setError(message || 'An error occurred');
      setIsListening(false);
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
      
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error('Please allow microphone access to use voice chat');
      }

      const config = await getElevenLabsConfig();
      
      if (!config.agentId || !config.apiKey) {
        throw new Error('Voice chat is not configured. Please contact support.');
      }

      try {
        const signedUrl = await getSignedUrl();
        await conversation.startSession({ signedUrl });
        console.log('Connected using signed URL');
      } catch (signedUrlError) {
        console.log('Falling back to direct connection', signedUrlError);
        try {
          const cleanAgentId = decodeURIComponent(config.agentId);
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
      setIsListening(false);
    }
  }, [conversation]);

  const stopVoiceChat = useCallback(async () => {
    try {
      await conversation.endSession();
      setError(null);
      setIsListening(false);
    } catch (error: unknown) {
      console.error('Failed to stop voice chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop voice chat');
    }
  }, [conversation]);

  const generateUniqueId = () => {
    messageCountRef.current += 1;
    return `${Date.now()}-${messageCountRef.current}`;
  };

  const addMessage = async (content: string, type: 'user' | 'assistant', messageAttachments: Attachment[] = []) => {
    const newMessage = {
      id: generateUniqueId(),
      content,
      type,
      timestamp: new Date().toISOString(),
      attachments: messageAttachments,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const handleAttachFiles = async (files: FileList) => {
    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      const type = file.type.startsWith('image/') ? 'image' : 'document';
      
      const attachment: Attachment = {
        id,
        file,
        type,
      };

      if (type === 'image') {
        attachment.previewUrl = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatState.messages]);

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 top-[72px]",
      "flex items-center justify-center overflow-hidden",
      chatState.messages.length === 0 && "top-0"
    )}>
      <div className={cn(
        "w-full h-full max-w-7xl flex items-center justify-center",
        chatState.messages.length === 0 ? "p-0" : "p-4"
      )}>
        <div className={cn(
          "flex flex-col w-full h-full",
          chatState.messages.length === 0 
            ? "md:w-[600px] md:h-auto" 
            : "md:flex-row",
          chatState.messages.length === 0 && "md:shadow-2xl md:rounded-2xl overflow-hidden"
        )}>
          {/* Animation Section */}
          <div className={cn(
            chatState.messages.length === 0 
              ? "h-[100dvh] md:h-[600px] w-full" 
              : "h-[400px] md:h-full w-full md:w-[35%] lg:w-[30%]",
            "flex flex-col items-center justify-between shrink-0",
            "bg-gradient-to-br from-gray-50 to-gray-100",
            chatState.messages.length === 0 
              ? "rounded-none md:rounded-2xl"
              : "rounded-t-lg md:rounded-l-lg md:rounded-r-none",
            chatState.messages.length > 0 && "md:border-r border-border"
          )}>
            {/* Center container with padding for button */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
              <button
                onClick={isListening ? stopVoiceChat : startVoiceChat}
                className={cn(
                  "relative w-full max-w-[280px] aspect-square p-4",
                  "rounded-full bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm",
                  "hover:scale-105 transition-all duration-300 cursor-pointer",
                  "group"
                )}
              >
                <AIAgentIcon isActive={isListening} />
                <span className={cn(
                  "absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium whitespace-nowrap",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "flex items-center gap-2",
                  isListening ? "text-gray-700" : "text-gray-600"
                )}>
                  {isListening ? (
                    <>
                      <PhoneOff className="h-4 w-4" />
                      Tap to Stop
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" />
                      Tap to Talk
                    </>
                  )}
                </span>
              </button>

              {chatState.messages.length === 0 && (
                <p className="mt-16 text-center text-sm text-gray-600/80">
                  Start a conversation with our AI Support Agent
                </p>
              )}
            </div>

            {/* Fixed bottom container for attachment button - Only show when conversation started */}
            {chatState.messages.length > 0 && (
              <div className="w-full h-16 flex items-center justify-center border-t border-gray-200/50">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => e.target.files && handleAttachFiles(e.target.files)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Chat Section */}
          {chatState.messages.length > 0 && (
            <Card className="flex-1 min-h-0 border-0 md:border-l md:rounded-l-none flex flex-col h-full md:pl-4">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Main Content Area with Messages */}
                <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
                  <div className="p-4 space-y-4">
                    {chatState.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words",
                          message.type === 'user'
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted",
                          "max-w-[80%] min-w-0 w-fit"
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 w-full">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="relative w-16 h-16 rounded-md overflow-hidden"
                              >
                                {attachment.type === 'image' && attachment.previewUrl ? (
                                  <img
                                    src={attachment.previewUrl}
                                    alt="attachment"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Paperclip className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-2 text-sm text-red-500 text-center bg-red-50">
                    {error}
                  </div>
                )}

                {/* Attachments Preview - Fixed at Bottom */}
                {attachments.length > 0 && (
                  <div className="h-20 border-t bg-background">
                    <div className="h-full overflow-x-auto">
                      <div className="flex gap-1 p-2 h-full">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden group"
                          >
                            {attachment.type === 'image' && attachment.previewUrl ? (
                              <img
                                src={attachment.previewUrl}
                                alt="attachment"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Paperclip className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveAttachment(attachment.id)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 