import React from 'react';
import { Attachment } from '@/types/chat';
import { ScrollArea } from "@/components/ui/scroll-area";
import { File as FileIcon } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
  attachments?: Attachment[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, timestamp, attachments }) => {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isBot
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-500 text-white'
        }`}
      >
        <p className="text-sm">{message}</p>
        
        {attachments && attachments.length > 0 && (
          <ScrollArea className="mt-2 max-h-[200px]">
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="relative group">
                  {attachment.type === 'image' && attachment.previewUrl ? (
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.file.name}
                      className="w-full h-[100px] object-cover rounded cursor-pointer"
                      onClick={() => window.open(attachment.previewUrl, '_blank')}
                    />
                  ) : (
                    <div className="w-full h-[100px] bg-secondary rounded flex items-center justify-center cursor-pointer"
                         onClick={() => window.open(URL.createObjectURL(attachment.file), '_blank')}>
                      <FileIcon className="h-8 w-8" />
                      <span className="text-xs mt-1 text-center break-all px-2">
                        {attachment.file.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <span className="text-xs opacity-70 mt-1 block">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage; 