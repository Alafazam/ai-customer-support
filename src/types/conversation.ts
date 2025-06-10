// Conversation Logging Types

export interface ConversationLogPayload {
  type: "post_call_transcription";
  event_timestamp: number;
  data: ConversationData;
}

export interface ConversationData {
  agent_id: string;
  conversation_id: string;
  status: string;
  transcript: TranscriptTurn[];
  metadata: ConversationMetadata;
  analysis: ConversationAnalysis;
  conversation_initiation_client_data: ConversationInitiation;
}

export interface TranscriptTurn {
  role: "agent" | "user";
  message: string;
  tool_calls: ToolCall[] | null;
  tool_results: ToolResult[] | null;
  feedback: string | null;
  time_in_call_secs: number;
  conversation_turn_metrics: Record<string, any> | null;
}

export interface ToolCall {
  name: string;
  function?: string;
  parameters?: Record<string, any>;
  timestamp?: string;
}

export interface ToolResult {
  result?: Record<string, any>;
  success?: boolean;
  error?: string;
  timestamp?: string;
}

export interface ConversationMetadata {
  start_time_unix_secs: number;
  call_duration_secs: number;
  cost: number;
  deletion_settings: DeletionSettings;
  feedback: FeedbackData;
  authorization_method: string;
  charging: ChargingData;
  termination_reason: string;
}

export interface DeletionSettings {
  deletion_time_unix_secs: number;
  deleted_logs_at_time_unix_secs: number | null;
  deleted_audio_at_time_unix_secs: number | null;
  deleted_transcript_at_time_unix_secs: number | null;
  delete_transcript_and_pii: boolean;
  delete_audio: boolean;
}

export interface FeedbackData {
  overall_score: number | null;
  likes: number;
  dislikes: number;
}

export interface ChargingData {
  dev_discount: boolean;
}

export interface ConversationAnalysis {
  evaluation_criteria_results: Record<string, any>;
  data_collection_results: Record<string, any>;
  call_successful: "success" | "failure" | "partial";
  transcript_summary: string;
}

export interface ConversationInitiation {
  conversation_config_override: ConfigOverride;
  custom_llm_extra_body: Record<string, any>;
  dynamic_variables: Record<string, any>;
}

export interface ConfigOverride {
  agent: AgentConfig;
  tts: TTSConfig;
}

export interface AgentConfig {
  prompt: string | null;
  first_message: string | null;
  language: string;
}

export interface TTSConfig {
  voice_id: string | null;
}

// API Response Types
export interface ConversationLogResponse {
  success: boolean;
  data?: {
    id: string;
    conversationId: string;
  };
  error?: string;
}

export interface ConversationsListResponse {
  success: boolean;
  data?: {
    conversations: ConversationSummary[];
    totalCount: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface ConversationSummary {
  id: string;
  agentId: string;
  conversationId: string;
  status: string;
  eventTimestamp: Date;
  callDurationSecs: number | null;
  cost: number | null;
  callSuccessful: string | null;
  transcriptSummary: string | null;
  turnCount: number;
}

export interface ConversationDetailResponse {
  success: boolean;
  data?: ConversationDetail;
  error?: string;
}

export interface ConversationDetail {
  id: string;
  agentId: string;
  conversationId: string;
  status: string;
  eventTimestamp: Date;
  callDurationSecs: number | null;
  cost: number | null;
  callSuccessful: string | null;
  transcriptSummary: string | null;
  transcripts: TranscriptDetail[];
  metadata: ConversationMetadataDetail | null;
  analysis: ConversationAnalysisDetail | null;
  initiation: ConversationInitiationDetail | null;
}

export interface TranscriptDetail {
  id: string;
  role: string;
  message: string | null;
  timeInCallSecs: number | null;
  feedback: string | null;
  toolCalls: ToolCallDetail[];
  toolResults: ToolResultDetail[];
}

export interface ToolCallDetail {
  id: string;
  toolName: string;
  toolFunction: string | null;
  parameters: Record<string, any> | null;
  callTimestamp: Date | null;
}

export interface ToolResultDetail {
  id: string;
  result: Record<string, any> | null;
  success: boolean | null;
  error: string | null;
  responseTimestamp: Date | null;
}

export interface ConversationMetadataDetail {
  startTimeUnixSecs: number | null;
  callDurationSecs: number | null;
  cost: number | null;
  overallScore: number | null;
  likes: number;
  dislikes: number;
  devDiscount: boolean;
}

export interface ConversationAnalysisDetail {
  evaluationCriteriaResults: Record<string, any> | null;
  dataCollectionResults: Record<string, any> | null;
  callSuccessful: string | null;
  transcriptSummary: string | null;
}

export interface ConversationInitiationDetail {
  agentPrompt: string | null;
  agentFirstMessage: string | null;
  agentLanguage: string | null;
  ttsVoiceId: string | null;
  customLlmExtraBody: Record<string, any> | null;
  dynamicVariables: Record<string, any> | null;
}

// Search and Filter Types
export interface ConversationSearchParams {
  agentId?: string;
  status?: string;
  callSuccessful?: string;
  startDate?: string;
  endDate?: string;
  minDuration?: number;
  maxDuration?: number;
  minCost?: number;
  maxCost?: number;
  search?: string; // search in transcript summary or messages
  page?: number;
  limit?: number;
  sortBy?: "eventTimestamp" | "callDurationSecs" | "cost";
  sortOrder?: "asc" | "desc";
} 