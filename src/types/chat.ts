export type MessageType = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export type IssueType = 'SOP_GAP' | 'GENUINE_ISSUE' | 'UNCLASSIFIED';

export type ChatState = {
  messages: MessageType[];
  issueType: IssueType;
  currentStep: 'INITIAL' | 'GATHERING_INFO' | 'CLASSIFICATION' | 'RESOLUTION';
  orderDetails?: {
    orderId?: string;
    productsAffected?: number;
    repeatAttempts?: number;
  };
}; 