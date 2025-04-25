'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { MessageType, ChatState, IssueType } from '@/types/chat';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

const ChatBot: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    issueType: 'UNCLASSIFIED',
    currentStep: 'INITIAL',
  });
  const [inputValue, setInputValue] = useState('');
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  const generateUniqueId = () => {
    messageCountRef.current += 1;
    return `${Date.now()}-${messageCountRef.current}`;
  };

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: MessageType = {
      id: generateUniqueId(),
      content,
      role,
      timestamp: new Date(),
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const classifyIssue = (userInput: string): IssueType => {
    // This is a simple classification logic. In a real application, 
    // you would want to use a more sophisticated approach or AI model
    const sopKeywords = ['how to', 'guide', 'documentation', 'steps', 'process'];
    const genuineIssueKeywords = ['error', 'not working', 'failed', 'broken', 'issue'];

    const lowercaseInput = userInput.toLowerCase();
    
    if (sopKeywords.some(keyword => lowercaseInput.includes(keyword))) {
      return 'SOP_GAP';
    } else if (genuineIssueKeywords.some(keyword => lowercaseInput.includes(keyword))) {
      return 'GENUINE_ISSUE';
    }
    
    return 'UNCLASSIFIED';
  };

  const handleSOPGap = () => {
    addMessage("Let me help you find the right documentation. First, could you confirm if you've checked our help center?", 'assistant');
    setChatState(prev => ({ ...prev, currentStep: 'GATHERING_INFO' }));
  };

  const handleGenuineIssue = () => {
    addMessage("I understand you're experiencing an issue. To help you better, please provide:", 'assistant');
    addMessage("1. The order ID\n2. Number of products affected\n3. How many times you've tried the operation", 'assistant');
    setChatState(prev => ({ ...prev, currentStep: 'GATHERING_INFO' }));
  };

  const processUserInput = () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue, 'user');

    if (chatState.currentStep === 'INITIAL') {
      const issueType = classifyIssue(inputValue);
      setChatState(prev => ({ ...prev, issueType }));

      if (issueType === 'SOP_GAP') {
        handleSOPGap();
      } else if (issueType === 'GENUINE_ISSUE') {
        handleGenuineIssue();
      } else {
        addMessage("Could you please provide more details about your issue?", 'assistant');
      }
    } else if (chatState.currentStep === 'GATHERING_INFO') {
      // Process gathered information
      if (chatState.issueType === 'GENUINE_ISSUE') {
        // Here you would typically parse the input for order details
        // and create a Freshdesk ticket
        addMessage("Thank you for providing the details. I'll create a support ticket for you right away.", 'assistant');
        setChatState(prev => ({ ...prev, currentStep: 'RESOLUTION' }));
      } else {
        // Provide relevant documentation
        addMessage("Based on your issue, here are some helpful resources: [Documentation links would go here]", 'assistant');
        setChatState(prev => ({ ...prev, currentStep: 'RESOLUTION' }));
      }
    }

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
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <img src="/bot-avatar.png" alt="Bot" />
          </Avatar>
          Support Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full pr-4">
          <ScrollAreaPrimitive.Viewport ref={scrollViewportRef} className="h-full w-full">
            {chatState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                } mb-4`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-primary text-primary-foreground'
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
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && processUserInput()}
          />
          <Button onClick={processUserInput}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatBot; 