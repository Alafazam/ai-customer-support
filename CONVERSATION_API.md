# Conversation Logging API Documentation

## Overview

The Conversation Logging API provides endpoints for logging, retrieving, and analyzing AI agent conversations. It supports comprehensive conversation data including transcripts, tool calls, metadata, and analytics.

## Database Schema

The system uses a normalized database schema with the following main tables:

- **Conversation** - Main conversation records
- **ConversationTranscript** - Individual conversation turns
- **ToolCall** & **ToolResult** - Tool interaction data
- **ConversationMetadata** - Timing, cost, and feedback data
- **ConversationAnalysis** - Analysis results and summaries
- **ConversationInitiation** - Initial configuration data
- **ConversationDeletionSettings** - Data retention settings

## API Endpoints

### 1. Log Conversation

**POST** `/api/conversations/log`

Logs a complete conversation with all associated data.

#### Request Body

```json
{
  "type": "post_call_transcription",
  "event_timestamp": 1739537297,
  "data": {
    "agent_id": "agent_xyz_123",
    "conversation_id": "conv_abc_456",
    "status": "done",
    "transcript": [
      {
        "role": "agent",
        "message": "Hello! How can I help you today?",
        "tool_calls": null,
        "tool_results": null,
        "feedback": null,
        "time_in_call_secs": 0,
        "conversation_turn_metrics": null
      },
      {
        "role": "user",
        "message": "I need help with my order",
        "tool_calls": null,
        "tool_results": null,
        "feedback": null,
        "time_in_call_secs": 2,
        "conversation_turn_metrics": null
      }
    ],
    "metadata": {
      "start_time_unix_secs": 1739537297,
      "call_duration_secs": 22,
      "cost": 296,
      "deletion_settings": {
        "deletion_time_unix_secs": 1802609320,
        "deleted_logs_at_time_unix_secs": null,
        "deleted_audio_at_time_unix_secs": null,
        "deleted_transcript_at_time_unix_secs": null,
        "delete_transcript_and_pii": true,
        "delete_audio": true
      },
      "feedback": {
        "overall_score": 4,
        "likes": 1,
        "dislikes": 0
      },
      "authorization_method": "authorization_header",
      "charging": {
        "dev_discount": true
      },
      "termination_reason": "user_ended"
    },
    "analysis": {
      "evaluation_criteria_results": {},
      "data_collection_results": {},
      "call_successful": "success",
      "transcript_summary": "Customer inquiry about order status resolved successfully"
    },
    "conversation_initiation_client_data": {
      "conversation_config_override": {
        "agent": {
          "prompt": null,
          "first_message": null,
          "language": "en"
        },
        "tts": {
          "voice_id": null
        }
      },
      "custom_llm_extra_body": {},
      "dynamic_variables": {
        "user_name": "John Doe"
      }
    }
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "conversationId": "conv_abc_456"
  }
}
```

### 2. List Conversations

**GET** `/api/conversations`

Retrieves a paginated list of conversations with filtering and sorting options.

#### Query Parameters

- `agentId` (string) - Filter by agent ID
- `status` (string) - Filter by conversation status
- `callSuccessful` (string) - Filter by success status ("success", "failure", "partial")
- `startDate` (string) - Filter conversations after this date (ISO format)
- `endDate` (string) - Filter conversations before this date (ISO format)
- `minDuration` (number) - Minimum call duration in seconds
- `maxDuration` (number) - Maximum call duration in seconds
- `minCost` (number) - Minimum cost filter
- `maxCost` (number) - Maximum cost filter
- `search` (string) - Search in transcript summaries and messages
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 25, max: 100)
- `sortBy` (string) - Sort field ("eventTimestamp", "callDurationSecs", "cost")
- `sortOrder` (string) - Sort order ("asc", "desc")

#### Example Request

```
GET /api/conversations?agentId=agent_xyz_123&limit=10&sortBy=eventTimestamp&sortOrder=desc
```

#### Response

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "clx1234567890",
        "agentId": "agent_xyz_123",
        "conversationId": "conv_abc_456",
        "status": "done",
        "eventTimestamp": "2025-01-14T15:30:00Z",
        "callDurationSecs": 22,
        "cost": 296,
        "callSuccessful": "success",
        "transcriptSummary": "Customer inquiry resolved",
        "turnCount": 3
      }
    ],
    "totalCount": 150,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

### 3. Get Conversation Details

**GET** `/api/conversations/{id}`

Retrieves detailed information for a specific conversation including all transcripts, tool calls, and metadata.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "agentId": "agent_xyz_123",
    "conversationId": "conv_abc_456",
    "status": "done",
    "eventTimestamp": "2025-01-14T15:30:00Z",
    "callDurationSecs": 22,
    "cost": 296,
    "callSuccessful": "success",
    "transcriptSummary": "Customer inquiry resolved",
    "transcripts": [
      {
        "id": "transcript_1",
        "role": "agent",
        "message": "Hello! How can I help you?",
        "timeInCallSecs": 0,
        "feedback": null,
        "toolCalls": [],
        "toolResults": []
      }
    ],
    "metadata": {
      "startTimeUnixSecs": 1739537297,
      "callDurationSecs": 22,
      "cost": 296,
      "overallScore": 4,
      "likes": 1,
      "dislikes": 0,
      "devDiscount": true
    },
    "analysis": {
      "evaluationCriteriaResults": {},
      "dataCollectionResults": {},
      "callSuccessful": "success",
      "transcriptSummary": "Customer inquiry resolved"
    },
    "initiation": {
      "agentPrompt": null,
      "agentFirstMessage": null,
      "agentLanguage": "en",
      "ttsVoiceId": null,
      "customLlmExtraBody": {},
      "dynamicVariables": {
        "user_name": "John Doe"
      }
    }
  }
}
```

### 4. Search Conversations

**POST** `/api/conversations/search`

Advanced search with analytics capabilities.

#### Request Body

```json
{
  "agentId": "agent_xyz_123",
  "callSuccessful": "success",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "includeAnalytics": true,
  "limit": 25,
  "page": 1
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "conversations": [...],
    "totalCount": 50,
    "pagination": {
      "page": 1,
      "limit": 25,
      "totalPages": 2
    },
    "analytics": {
      "averageDuration": 45,
      "averageCost": 250,
      "successRate": 95,
      "totalLikes": 120,
      "totalDislikes": 5,
      "averageRating": 4.2,
      "agentDistribution": [
        { "agentId": "agent_xyz_123", "count": 30 },
        { "agentId": "agent_abc_789", "count": 20 }
      ],
      "statusDistribution": [
        { "status": "done", "count": 45 },
        { "status": "in_progress", "count": 5 }
      ]
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid payload or parameters)
- `404` - Not Found (conversation doesn't exist)
- `500` - Internal Server Error

## Analytics Metrics

When `includeAnalytics: true` is included in search requests, the following metrics are calculated:

- **averageDuration** - Average call duration in seconds
- **averageCost** - Average cost per conversation
- **successRate** - Percentage of successful conversations
- **totalLikes/totalDislikes** - Aggregated feedback counts
- **averageRating** - Average overall score from feedback
- **agentDistribution** - Conversation count per agent
- **statusDistribution** - Conversation count per status

## Usage Examples

### Log a conversation
```bash
curl -X POST http://localhost:3001/api/conversations/log \
  -H "Content-Type: application/json" \
  -d @conversation_payload.json
```

### Get recent conversations
```bash
curl "http://localhost:3001/api/conversations?limit=10&sortBy=eventTimestamp&sortOrder=desc"
```

### Search with analytics
```bash
curl -X POST http://localhost:3001/api/conversations/search \
  -H "Content-Type: application/json" \
  -d '{"agentId": "agent_123", "includeAnalytics": true}'
```

## Testing

Run the test script to validate all endpoints:

```bash
node test-conversation-api.js
```

This will test:
- Conversation logging
- Listing conversations
- Retrieving conversation details
- Advanced search with analytics

## Future Enhancements

The current implementation provides the foundation for:

1. **Real-time Analytics Dashboard** - Agent performance monitoring
2. **Aggregation Tables** - Pre-calculated metrics for faster queries
3. **Advanced Filtering** - Tool usage, sentiment analysis, etc.
4. **Export Capabilities** - CSV/Excel export for reporting
5. **Webhook Integration** - Real-time notifications for events 