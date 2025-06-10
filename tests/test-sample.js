// Simple test script to log the sample conversation
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api/conversations';

async function testSampleConversation() {
  console.log('🚀 Testing Sample Conversation Logging\n');

  // Load sample data
  try {
    const samplePath = path.join(__dirname, 'tests', 'sample.json');
    const rawData = fs.readFileSync(samplePath, 'utf8');
    const sample = JSON.parse(rawData);
    const payload = sample.body; // Extract the body which contains our conversation data

    console.log('📋 Sample Conversation Details:');
    console.log(`   Agent ID: ${payload.data.agent_id}`);
    console.log(`   Conversation ID: ${payload.data.conversation_id}`);
    console.log(`   Status: ${payload.data.status}`);
    console.log(`   Duration: ${payload.data.metadata.call_duration_secs} seconds`);
    console.log(`   Cost: ${payload.data.metadata.cost}`);
    console.log(`   Transcript turns: ${payload.data.transcript.length}`);
    console.log(`   Call successful: ${payload.data.analysis.call_successful}`);
    console.log(`   User name: ${payload.data.conversation_initiation_client_data.dynamic_variables.user_name}`);

    // Log the conversation
    console.log('\n📤 Sending to webhook...');
    const response = await fetch(`${BASE_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Success! Conversation logged:');
      console.log(`   Database ID: ${result.data.id}`);
      console.log(`   Conversation ID: ${result.data.conversationId}`);

      // Retrieve and display the stored data
      console.log('\n📥 Retrieving stored data...');
      const detailResponse = await fetch(`${BASE_URL}/${result.data.id}`);
      const detailResult = await detailResponse.json();

      if (detailResponse.ok && detailResult.success) {
        const data = detailResult.data;
        console.log('✅ Data retrieved successfully:');
        console.log(`   Transcripts stored: ${data.transcripts.length}`);
        console.log(`   Metadata: ${data.metadata ? '✅' : '❌'}`);
        console.log(`   Analysis: ${data.analysis ? '✅' : '❌'}`);
        console.log(`   Initiation: ${data.initiation ? '✅' : '❌'}`);

        // Show transcript preview
        console.log('\n💬 Transcript Preview:');
        data.transcripts.slice(0, 3).forEach((transcript, index) => {
          console.log(`   ${index + 1}. ${transcript.role}: "${transcript.message?.substring(0, 50)}${transcript.message?.length > 50 ? '...' : ''}"`);
        });

        if (data.transcripts.length > 3) {
          console.log(`   ... and ${data.transcripts.length - 3} more transcripts`);
        }

        // Show metrics if available
        if (data.metadata) {
          console.log('\n📊 Stored Metadata:');
          console.log(`   Likes: ${data.metadata.likes}`);
          console.log(`   Dislikes: ${data.metadata.dislikes}`);
          console.log(`   Dev Discount: ${data.metadata.devDiscount}`);
        }

        console.log('\n🎉 All data stored and retrieved successfully!');
      } else {
        console.error('❌ Failed to retrieve stored data:', detailResult.error);
      }

    } else {
      console.error('❌ Failed to log conversation:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testSampleConversation().catch(console.error); 