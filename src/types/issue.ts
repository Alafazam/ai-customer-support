export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size: string;
}

export interface SystemLog {
  id: string;
  name: string;
  timestamp: string;
  status: 'error' | 'warning' | 'success';
  summary: string;
  details: string;
  logUrl: string;
  duration?: number;
  parentId?: string;
  type: 'API_CALL' | 'DATABASE' | 'SERVICE' | 'NOTIFICATION' | 'PROCESS';
  metadata?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    service?: string;
    orderId?: string;
    customerId?: string;
    [key: string]: any;
  };
}

export interface IssueActions {
  canSendResponse: boolean;
  canCreateOIM: boolean;
  canCreateOIIM: boolean;
  canGenerateRca?: boolean;
  availableTemplates?: {
    id: string;
    name: string;
    type: string;
  }[];
}

export interface Issue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  type?: string;
  channel?: string;
  customer: Customer;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  responseTime: string;
  slaStatus: 'within_limit' | 'exceeded';
  slaDeadline?: string;
  firstResponseSent?: string;
  firstResponseTime?: string;
  description: string;
  attachments?: Attachment[];
  aiSummary?: string;
  technicalRca?: string;
  customerRca?: string;
  systemLogs?: SystemLog[];
  actions?: IssueActions;
}

export interface IssueMetrics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  averageResponseTime: string;
  slaAdherence: number;
  criticalIssues: number;
  customerSatisfaction: number;
}

export interface IssuesData {
  metrics: IssueMetrics;
  issues: Issue[];
} 