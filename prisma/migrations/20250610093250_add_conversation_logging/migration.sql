-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eventTimestamp" DATETIME NOT NULL,
    "startTimeUnixSecs" INTEGER,
    "callDurationSecs" INTEGER,
    "cost" INTEGER,
    "callSuccessful" TEXT,
    "transcriptSummary" TEXT,
    "terminationReason" TEXT,
    "authorizationMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConversationTranscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT,
    "timeInCallSecs" INTEGER,
    "feedback" TEXT,
    "conversationTurnMetrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationTranscript_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transcriptId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "toolFunction" TEXT,
    "parameters" TEXT,
    "callTimestamp" DATETIME,
    CONSTRAINT "ToolCall_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "ConversationTranscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toolCallId" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "result" TEXT,
    "success" BOOLEAN,
    "error" TEXT,
    "responseTimestamp" DATETIME,
    CONSTRAINT "ToolResult_toolCallId_fkey" FOREIGN KEY ("toolCallId") REFERENCES "ToolCall" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ToolResult_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "ConversationTranscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "startTimeUnixSecs" INTEGER,
    "callDurationSecs" INTEGER,
    "cost" INTEGER,
    "authorizationMethod" TEXT,
    "terminationReason" TEXT,
    "overallScore" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "devDiscount" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConversationMetadata_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "evaluationCriteriaResults" TEXT,
    "dataCollectionResults" TEXT,
    "callSuccessful" TEXT,
    "transcriptSummary" TEXT,
    CONSTRAINT "ConversationAnalysis_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationInitiation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "agentPrompt" TEXT,
    "agentFirstMessage" TEXT,
    "agentLanguage" TEXT,
    "ttsVoiceId" TEXT,
    "customLlmExtraBody" TEXT,
    "dynamicVariables" TEXT,
    CONSTRAINT "ConversationInitiation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationDeletionSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "deletionTimeUnixSecs" INTEGER,
    "deletedLogsAtTimeUnixSecs" INTEGER,
    "deletedAudioAtTimeUnixSecs" INTEGER,
    "deletedTranscriptAtTimeUnixSecs" INTEGER,
    "deleteTranscriptAndPii" BOOLEAN NOT NULL DEFAULT false,
    "deleteAudio" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConversationDeletionSettings_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_conversationId_key" ON "Conversation"("conversationId");

-- CreateIndex
CREATE INDEX "Conversation_agentId_idx" ON "Conversation"("agentId");

-- CreateIndex
CREATE INDEX "Conversation_conversationId_idx" ON "Conversation"("conversationId");

-- CreateIndex
CREATE INDEX "Conversation_eventTimestamp_idx" ON "Conversation"("eventTimestamp");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "ConversationTranscript_conversationId_idx" ON "ConversationTranscript"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationTranscript_role_idx" ON "ConversationTranscript"("role");

-- CreateIndex
CREATE INDEX "ToolCall_transcriptId_idx" ON "ToolCall"("transcriptId");

-- CreateIndex
CREATE INDEX "ToolCall_toolName_idx" ON "ToolCall"("toolName");

-- CreateIndex
CREATE INDEX "ToolResult_toolCallId_idx" ON "ToolResult"("toolCallId");

-- CreateIndex
CREATE INDEX "ToolResult_transcriptId_idx" ON "ToolResult"("transcriptId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMetadata_conversationId_key" ON "ConversationMetadata"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationMetadata_conversationId_idx" ON "ConversationMetadata"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationAnalysis_conversationId_key" ON "ConversationAnalysis"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationAnalysis_conversationId_idx" ON "ConversationAnalysis"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationAnalysis_callSuccessful_idx" ON "ConversationAnalysis"("callSuccessful");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationInitiation_conversationId_key" ON "ConversationInitiation"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationInitiation_conversationId_idx" ON "ConversationInitiation"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationDeletionSettings_conversationId_key" ON "ConversationDeletionSettings"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationDeletionSettings_conversationId_idx" ON "ConversationDeletionSettings"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationDeletionSettings_deletionTimeUnixSecs_idx" ON "ConversationDeletionSettings"("deletionTimeUnixSecs");
