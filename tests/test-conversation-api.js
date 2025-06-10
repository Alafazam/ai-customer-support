// Test script for conversation logging API
const BASE_URL = 'http://localhost:3001/api/conversations';

// Sample conversation payload based on the provided structure
const samplePayload = {
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
        "message": "I need help with my order status",
        "tool_calls": null,
        "tool_results": null,
        "feedback": null,
        "time_in_call_secs": 2,
        "conversation_turn_metrics": null
      },
      {
        "role": "agent",
        "message": "I can help you check your order status. Let me look that up for you.",
        "tool_calls": [
          {
            "name": "check_order_status",
            "function": "getOrderById",
            "parameters": { "orderId": "12345" },
            "timestamp": "2025-01-14T15:30:00Z"
          }
        ],
        "tool_results": [
          {
            "result": { "status": "shipped", "tracking": "TRK123456" },
            "success": true,
            "error": null,
            "timestamp": "2025-01-14T15:30:02Z"
          }
        ],
        "feedback": null,
        "time_in_call_secs": 5,
        "conversation_turn_metrics": { "response_time_ms": 1200 }
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
      "evaluation_criteria_results": { "helpfulness": 0.9, "accuracy": 0.95 },
      "data_collection_results": { "entities_extracted": ["order_id", "tracking_number"] },
      "call_successful": "success",
      "transcript_summary": "Customer inquired about order status. Agent successfully retrieved and provided tracking information."
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
};

async function testLogConversation() {
  console.log('🧪 Testing conversation logging...');
  
  try {
    const response = await fetch(`${BASE_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(samplePayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Conversation logged successfully:', result);
      return result.data.id;
    } else {
      console.error('❌ Failed to log conversation:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error logging conversation:', error);
    return null;
  }
}

async function testGetConversations() {
  console.log('\n🧪 Testing conversation listing...');
  
  try {
    const response = await fetch(`${BASE_URL}?limit=10&sortBy=eventTimestamp&sortOrder=desc`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Conversations retrieved successfully:');
      console.log(`   Total: ${result.data.totalCount}`);
      console.log(`   Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
      console.log(`   Conversations: ${result.data.conversations.length}`);
      return result.data.conversations;
    } else {
      console.error('❌ Failed to get conversations:', result);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    return [];
  }
}

async function testGetConversationDetail(conversationId) {
  if (!conversationId) return;
  
  console.log('\n🧪 Testing conversation detail retrieval...');
  
  try {
    const response = await fetch(`${BASE_URL}/${conversationId}`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Conversation detail retrieved successfully:');
      console.log(`   ID: ${result.data.id}`);
      console.log(`   Agent: ${result.data.agentId}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Transcripts: ${result.data.transcripts.length}`);
      console.log(`   Tool calls: ${result.data.transcripts.reduce((sum, t) => sum + t.toolCalls.length, 0)}`);
    } else {
      console.error('❌ Failed to get conversation detail:', result);
    }
  } catch (error) {
    console.error('❌ Error getting conversation detail:', error);
  }
}

async function testSearchConversations() {
  console.log('\n🧪 Testing conversation search...');
  
  const searchCriteria = {
    agentId: "agent_xyz_123",
    callSuccessful: "success",
    includeAnalytics: true,
    limit: 5
  };
  
  try {
    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchCriteria)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Search completed successfully:');
      console.log(`   Found: ${result.data.totalCount} conversations`);
      if (result.data.analytics) {
        console.log('   Analytics:');
        console.log(`     Success Rate: ${result.data.analytics.successRate}%`);
        console.log(`     Avg Duration: ${result.data.analytics.averageDuration}s`);
        console.log(`     Avg Cost: ${result.data.analytics.averageCost}`);
      }
    } else {
      console.error('❌ Search failed:', result);
    }
  } catch (error) {
    console.error('❌ Error during search:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Conversation API Tests\n');
  
  // Test logging
  const conversationId = await testLogConversation();
  
  // Test listing
  const conversations = await testGetConversations();
  
  // Test detail retrieval
  const testId = conversationId || (conversations.length > 0 ? conversations[0].id : null);
  await testGetConversationDetail(testId);
  
  // Test search
  await testSearchConversations();
  
  console.log('\n🎉 All tests completed!');
}

// Check if running directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = { runTests, testLogConversation, testGetConversations }; 