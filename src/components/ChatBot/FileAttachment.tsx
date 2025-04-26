import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { Attachment } from '@/types/chat';

interface FileAttachmentProps {
  attachments: Attachment[];
  onAttach: (files: FileList) => void;
  onRemove: (id: string) => void;
}

export function FileAttachment({ attachments, onAttach, onRemove }: FileAttachmentProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-2">
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      {attachments.length > 0 && (
        <ScrollArea className="h-20 w-full rounded-md border">
          <div className="p-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-secondary p-2 rounded-md"
              >
                {attachment.type === 'image' && attachment.previewUrl ? (
                  <img
                    src={attachment.previewUrl}
                    alt="Preview"
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  getFileIcon(attachment.type)
                )}
                <span className="text-sm truncate max-w-[100px]">
                  {attachment.file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => onRemove(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        Attach Files
      </Button>
    </div>
  );
} 