export type MessageType = 'user' | 'assistant';

export interface Attachment {
  id: string;
  file: File;
  previewUrl?: string;
  type: 'image' | 'document' | 'other';
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
  attachments?: Attachment[];
}

export type IssueType = 'SOP_GAP' | 'GENUINE_ISSUE' | 'UNKNOWN';

export interface ChatState {
  messages: Message[];
  issueType: 'UNKNOWN' | string;
  currentStep: 'INITIAL' | string;
}