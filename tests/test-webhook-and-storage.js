// Test script for conversation webhook and data storage verification
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api/conversations';

// Read the sample conversation data
function loadSampleConversation() {
  try {
    const samplePath = path.join(__dirname, 'tests', 'sample.json');
    const rawData = fs.readFileSync(samplePath, 'utf8');
    const sample = JSON.parse(rawData);
    return sample.body; // Extract the body part which contains our payload
  } catch (error) {
    console.error('❌ Error loading sample conversation:', error.message);
    return null;
  }
}

// Test 1: Log the conversation via webhook
async function testConversationLogging() {
  console.log('🧪 Test 1: Testing conversation webhook logging...');
  
  const sampleData = loadSampleConversation();
  if (!sampleData) {
    console.error('❌ Failed to load sample data');
    return null;
  }

  console.log(`   📝 Conversation ID: ${sampleData.data.conversation_id}`);
  console.log(`   👤 Agent ID: ${sampleData.data.agent_id}`);
  console.log(`   💬 Transcript turns: ${sampleData.data.transcript.length}`);
  console.log(`   ⏱️  Duration: ${sampleData.data.metadata.call_duration_secs}s`);
  console.log(`   💰 Cost: ${sampleData.data.metadata.cost}`);

  try {
    const response = await fetch(`${BASE_URL}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Conversation logged successfully!');
      console.log(`   🆔 Generated ID: ${result.data.id}`);
      console.log(`   🔗 Conversation ID: ${result.data.conversationId}`);
      return {
        dbId: result.data.id,
        conversationId: result.data.conversationId,
        originalData: sampleData
      };
    } else {
      console.error('❌ Failed to log conversation:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during logging:', error.message);
    return null;
  }
}

// Test 2: Verify data retrieval
async function testDataRetrieval(logResult) {
  if (!logResult) return false;

  console.log('\n🧪 Test 2: Testing data retrieval...');
  
  try {
    const response = await fetch(`${BASE_URL}/${logResult.dbId}`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Data retrieved successfully!');
      return result.data;
    } else {
      console.error('❌ Failed to retrieve data:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during retrieval:', error.message);
    return null;
  }
}

// Test 3: Verify data integrity
async function verifyDataIntegrity(originalData, retrievedData) {
  if (!originalData || !retrievedData) return false;

  console.log('\n🧪 Test 3: Verifying data integrity...');
  
  const checks = [];

  // Basic conversation data
  checks.push({
    name: 'Agent ID',
    expected: originalData.data.agent_id,
    actual: retrievedData.agentId,
    pass: originalData.data.agent_id === retrievedData.agentId
  });

  checks.push({
    name: 'Conversation ID',
    expected: originalData.data.conversation_id,
    actual: retrievedData.conversationId,
    pass: originalData.data.conversation_id === retrievedData.conversationId
  });

  checks.push({
    name: 'Status',
    expected: originalData.data.status,
    actual: retrievedData.status,
    pass: originalData.data.status === retrievedData.status
  });

  checks.push({
    name: 'Call Duration',
    expected: originalData.data.metadata.call_duration_secs,
    actual: retrievedData.callDurationSecs,
    pass: originalData.data.metadata.call_duration_secs === retrievedData.callDurationSecs
  });

  checks.push({
    name: 'Cost',
    expected: originalData.data.metadata.cost,
    actual: retrievedData.cost,
    pass: originalData.data.metadata.cost === retrievedData.cost
  });

  checks.push({
    name: 'Call Successful',
    expected: originalData.data.analysis.call_successful,
    actual: retrievedData.callSuccessful,
    pass: originalData.data.analysis.call_successful === retrievedData.callSuccessful
  });

  checks.push({
    name: 'Transcript Summary',
    expected: originalData.data.analysis.transcript_summary,
    actual: retrievedData.transcriptSummary,
    pass: originalData.data.analysis.transcript_summary === retrievedData.transcriptSummary
  });

  // Transcript data
  checks.push({
    name: 'Transcript Count',
    expected: originalData.data.transcript.length,
    actual: retrievedData.transcripts.length,
    pass: originalData.data.transcript.length === retrievedData.transcripts.length
  });

  // Metadata checks
  if (retrievedData.metadata) {
    checks.push({
      name: 'Metadata Cost',
      expected: originalData.data.metadata.cost,
      actual: retrievedData.metadata.cost,
      pass: originalData.data.metadata.cost === retrievedData.metadata.cost
    });

    checks.push({
      name: 'Dev Discount',
      expected: originalData.data.metadata.charging.dev_discount,
      actual: retrievedData.metadata.devDiscount,
      pass: originalData.data.metadata.charging.dev_discount === retrievedData.metadata.devDiscount
    });

    checks.push({
      name: 'Likes',
      expected: originalData.data.metadata.feedback.likes,
      actual: retrievedData.metadata.likes,
      pass: originalData.data.metadata.feedback.likes === retrievedData.metadata.likes
    });
  }

  // Initiation data checks
  if (retrievedData.initiation) {
    checks.push({
      name: 'Agent Language',
      expected: originalData.data.conversation_initiation_client_data.conversation_config_override.agent.language,
      actual: retrievedData.initiation.agentLanguage,
      pass: originalData.data.conversation_initiation_client_data.conversation_config_override.agent.language === retrievedData.initiation.agentLanguage
    });

    const expectedUserName = originalData.data.conversation_initiation_client_data.dynamic_variables.user_name;
    const actualUserName = retrievedData.initiation.dynamicVariables ? retrievedData.initiation.dynamicVariables.user_name : null;
    checks.push({
      name: 'Dynamic Variables - User Name',
      expected: expectedUserName,
      actual: actualUserName,
      pass: expectedUserName === actualUserName
    });
  }

  // Print results
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.pass) {
      console.log(`   ✅ ${check.name}: ${check.actual}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.name}: Expected "${check.expected}", got "${check.actual}"`);
    }
  });

  const allPassed = passedChecks === checks.length;
  console.log(`\n   📊 Integrity Check: ${passedChecks}/${checks.length} checks passed`);
  
  return allPassed;
}

// Test 4: Verify transcript details
async function verifyTranscriptDetails(originalData, retrievedData) {
  if (!originalData || !retrievedData || !retrievedData.transcripts) return false;

  console.log('\n🧪 Test 4: Verifying transcript details...');
  
  const originalTranscripts = originalData.data.transcript;
  const retrievedTranscripts = retrievedData.transcripts;
  
  if (originalTranscripts.length !== retrievedTranscripts.length) {
    console.error(`❌ Transcript count mismatch: expected ${originalTranscripts.length}, got ${retrievedTranscripts.length}`);
    return false;
  }

  let transcriptChecks = 0;
  
  for (let i = 0; i < originalTranscripts.length; i++) {
    const original = originalTranscripts[i];
    const retrieved = retrievedTranscripts[i];
    
    const checks = [
      original.role === retrieved.role,
      original.message === retrieved.message,
      original.time_in_call_secs === retrieved.timeInCallSecs
    ];
    
    const allMatch = checks.every(check => check);
    
    if (allMatch) {
      console.log(`   ✅ Transcript ${i + 1}: Role="${retrieved.role}", Time=${retrieved.timeInCallSecs}s`);
      transcriptChecks++;
    } else {
      console.log(`   ❌ Transcript ${i + 1}: Mismatch detected`);
      console.log(`      Expected: role="${original.role}", message="${original.message}", time=${original.time_in_call_secs}`);
      console.log(`      Got: role="${retrieved.role}", message="${retrieved.message}", time=${retrieved.timeInCallSecs}`);
    }

    // Check conversation turn metrics if present
    if (original.conversation_turn_metrics) {
      console.log(`      📊 Has turn metrics: ${Object.keys(original.conversation_turn_metrics).length} metrics`);
    }
  }

  console.log(`   📊 Transcript verification: ${transcriptChecks}/${originalTranscripts.length} transcripts verified`);
  return transcriptChecks === originalTranscripts.length;
}

// Test 5: Test search functionality
async function testSearchFunctionality(logResult) {
  if (!logResult) return false;

  console.log('\n🧪 Test 5: Testing search functionality...');
  
  try {
    const searchCriteria = {
      agentId: logResult.originalData.data.agent_id,
      includeAnalytics: true,
      limit: 5
    };

    const response = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchCriteria)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Search completed successfully!');
      console.log(`   📊 Found ${result.data.totalCount} conversation(s)`);
      
      if (result.data.analytics) {
        console.log('   📈 Analytics included:');
        console.log(`      Success Rate: ${result.data.analytics.successRate}%`);
        console.log(`      Avg Duration: ${result.data.analytics.averageDuration}s`);
        console.log(`      Avg Cost: ${result.data.analytics.averageCost}`);
        console.log(`      Total Likes: ${result.data.analytics.totalLikes}`);
        console.log(`      Agent Distribution: ${result.data.analytics.agentDistribution.length} agents`);
      }
      
      // Check if our conversation is in the results
      const foundConversation = result.data.conversations.find(
        conv => conv.conversationId === logResult.conversationId
      );
      
      if (foundConversation) {
        console.log('   ✅ Our logged conversation found in search results!');
        return true;
      } else {
        console.log('   ⚠️  Our logged conversation not found in search results');
        return false;
      }
    } else {
      console.error('❌ Search failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during search:', error.message);
    return false;
  }
}

// Test 6: Test listing endpoint
async function testListingEndpoint() {
  console.log('\n🧪 Test 6: Testing listing endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}?limit=5&sortBy=eventTimestamp&sortOrder=desc`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Listing completed successfully!');
      console.log(`   📊 Total conversations: ${result.data.totalCount}`);
      console.log(`   📄 Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
      console.log(`   📝 Retrieved: ${result.data.conversations.length} conversations`);
      
      if (result.data.conversations.length > 0) {
        const latest = result.data.conversations[0];
        console.log(`   🕐 Latest conversation: ${latest.conversationId} (${latest.status})`);
      }
      
      return true;
    } else {
      console.error('❌ Listing failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during listing:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Conversation Webhook & Storage Tests\n');
  console.log('═'.repeat(60));
  
  const results = {
    logging: false,
    retrieval: false,
    integrity: false,
    transcripts: false,
    search: false,
    listing: false
  };

  // Test 1: Log conversation
  const logResult = await testConversationLogging();
  results.logging = !!logResult;

  if (!logResult) {
    console.log('\n❌ Cannot proceed with further tests - logging failed');
    return results;
  }

  // Test 2: Retrieve data
  const retrievedData = await testDataRetrieval(logResult);
  results.retrieval = !!retrievedData;

  if (retrievedData) {
    // Test 3: Verify data integrity
    results.integrity = await verifyDataIntegrity(logResult.originalData, retrievedData);
    
    // Test 4: Verify transcript details
    results.transcripts = await verifyTranscriptDetails(logResult.originalData, retrievedData);
  }

  // Test 5: Search functionality
  results.search = await testSearchFunctionality(logResult);

  // Test 6: Listing endpoint
  results.listing = await testListingEndpoint();

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const testResults = [
    { name: 'Conversation Logging', passed: results.logging },
    { name: 'Data Retrieval', passed: results.retrieval },
    { name: 'Data Integrity', passed: results.integrity },
    { name: 'Transcript Details', passed: results.transcripts },
    { name: 'Search Functionality', passed: results.search },
    { name: 'Listing Endpoint', passed: results.listing }
  ];

  let passedTests = 0;
  testResults.forEach(test => {
    const status = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.name}`);
    if (test.passed) passedTests++;
  });

  console.log('═'.repeat(60));
  console.log(`🏆 OVERALL RESULT: ${passedTests}/${testResults.length} tests passed`);
  
  if (passedTests === testResults.length) {
    console.log('🎉 All tests passed! Your conversation logging system is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, loadSampleConversation }; 