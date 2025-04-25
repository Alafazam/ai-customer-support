export type MessageType = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
}

export type IssueType = 'SOP_GAP' | 'GENUINE_ISSUE' | 'UNKNOWN';

export interface ChatState {
  messages: Message[];
  issueType: IssueType;
  currentStep: 'INITIAL' | 'GATHERING_INFO' | 'RESOLUTION';
}