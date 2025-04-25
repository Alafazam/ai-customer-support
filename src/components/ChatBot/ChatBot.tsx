'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatState, Attachment } from '@/types/chat';
import { useConversation } from '@11labs/react';
import { cn } from "@/lib/utils";
import { SendIcon } from '@/components/icons/SendIcon';
import { Paperclip, X } from 'lucide-react';

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
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
    onMessage: (message: ElevenLabsMessage) => {
      console.log('Message:', message);
      // Handle both voice and text responses
      if (message.source === 'ai') {
        // For voice responses, message.message will contain the transcribed text
        // For text responses, message.text will contain the response
        const content = message.message || message.text;
        if (content) {
          addMessage(content, 'assistant');
        }
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

      // Generate preview URL for images
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

  const processUserInput = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputValue.trim() && attachments.length === 0) return;

    // Add message with attachments
    await addMessage(inputValue || 'Attached files', 'user', attachments);
    
    // Send text to ElevenLabs agent
    if (inputValue.trim() && conversation.status === 'connected') {
      try {
        // Display the message locally
        const userMessage = inputValue.trim();
        
        // Get configuration from server
        const config = await getElevenLabsConfig();
        
        // Let the voice agent know about the text input
        // This will trigger the onMessage handler when the agent responds
        await conversation.startSession({
          agentId: config.agentId,  // Use agent ID from environment config
          origin: 'text',
          customLlmExtraBody: {
            text: userMessage
          }
        });
      } catch (error) {
        console.error('Failed to send text to agent:', error);
        setError('Failed to send message to agent. Please try again.');
      }
    }
    
    // Clear input and attachments
    setInputValue('');
    setAttachments([]);
  };

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatState.messages]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, []);

  return (
    <div className="fixed top-16 inset-x-0 bottom-0 flex items-center justify-center bg-background px-6 pb-6 pt-4">
      <div className="w-full md:w-[70%] h-full max-w-[1200px]">
        <Card className="w-full h-full grid grid-rows-[auto,1fr,auto] overflow-hidden">
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

          <CardContent className="p-0 overflow-hidden">
            <ScrollArea
              ref={scrollViewportRef}
              className="h-full"
              type="always"
            >
              <div className="flex flex-col p-4 gap-4">
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
                  chatState.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.type === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted",
                        "max-w-[80%] break-words"
                      )}
                    >
                      <div className="whitespace-pre-wrap overflow-hidden">{message.content}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="relative w-full">
                              {attachment.type === 'image' && attachment.previewUrl ? (
                                <img
                                  src={attachment.previewUrl}
                                  alt={attachment.file.name}
                                  className="w-full h-[80px] object-cover rounded cursor-pointer"
                                  onClick={() => window.open(attachment.previewUrl, '_blank')}
                                />
                              ) : (
                                <div
                                  className="w-full h-[80px] bg-secondary/50 rounded flex flex-col items-center justify-center cursor-pointer text-xs"
                                  onClick={() => window.open(URL.createObjectURL(attachment.file), '_blank')}
                                >
                                  <div className="px-2 text-center break-words w-full">
                                    {attachment.file.name}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 pt-2 shrink-0">
            <div className="flex flex-col gap-2 w-full">
              <form onSubmit={processUserInput} className="flex w-full gap-2">
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={(e) => e.target.files && handleAttachFiles(e.target.files)}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="shrink-0"
                  disabled={!inputValue.trim() && attachments.length === 0}
                >
                  <SendIcon />
                </Button>
              </form>

              {attachments.length > 0 && (
                <div className="grid grid-cols-6 gap-2 pt-3 px-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="relative flex flex-col items-center pt-2 px-2"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary/50 flex items-center justify-center relative group">
                        {attachment.type === 'image' && attachment.previewUrl ? (
                          <img
                            src={attachment.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Paperclip className="h-4 w-4" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-[0.225rem] -right-[0.225rem] h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-sm border-2 border-background"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X className="h-3.5 w-3.5 text-destructive-foreground" />
                        </Button>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 w-full text-center truncate px-1">
                        {attachment.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 