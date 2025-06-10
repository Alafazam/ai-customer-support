import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ConversationLogPayload, ConversationLogResponse } from '@/types/conversation';

const prisma = new PrismaClient();

export async function POST(request: NextRequest): Promise<NextResponse<ConversationLogResponse>> {
  try {
    const payload: ConversationLogPayload = await request.json();

    // Validate payload structure
    if (!payload.data || !payload.data.agent_id || !payload.data.conversation_id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payload: missing required fields (agent_id, conversation_id)'
      }, { status: 400 });
    }

    const { data } = payload;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create main conversation record
      const conversation = await tx.conversation.create({
        data: {
          agentId: data.agent_id,
          conversationId: data.conversation_id,
          status: data.status,
          eventTimestamp: new Date(payload.event_timestamp * 1000),
          startTimeUnixSecs: data.metadata?.start_time_unix_secs,
          callDurationSecs: data.metadata?.call_duration_secs,
          cost: data.metadata?.cost,
          callSuccessful: data.analysis?.call_successful,
          transcriptSummary: data.analysis?.transcript_summary,
          terminationReason: data.metadata?.termination_reason,
          authorizationMethod: data.metadata?.authorization_method,
        }
      });

      // Create transcript records
      if (data.transcript && data.transcript.length > 0) {
        for (const transcript of data.transcript) {
          const transcriptRecord = await tx.conversationTranscript.create({
            data: {
              conversationId: conversation.id,
              role: transcript.role,
              message: transcript.message,
              timeInCallSecs: transcript.time_in_call_secs,
              feedback: transcript.feedback ? JSON.stringify(transcript.feedback) : null,
              conversationTurnMetrics: transcript.conversation_turn_metrics ? 
                JSON.stringify(transcript.conversation_turn_metrics) : null,
            }
          });

          // Create tool calls if present
          if (transcript.tool_calls && transcript.tool_calls.length > 0) {
            for (const toolCall of transcript.tool_calls) {
              const toolCallRecord = await tx.toolCall.create({
                data: {
                  transcriptId: transcriptRecord.id,
                  toolName: toolCall.name,
                  toolFunction: toolCall.function,
                  parameters: toolCall.parameters ? JSON.stringify(toolCall.parameters) : null,
                  callTimestamp: toolCall.timestamp ? new Date(toolCall.timestamp) : null,
                }
              });

              // Create tool results if present
              if (transcript.tool_results && transcript.tool_results.length > 0) {
                for (const toolResult of transcript.tool_results) {
                  await tx.toolResult.create({
                    data: {
                      toolCallId: toolCallRecord.id,
                      transcriptId: transcriptRecord.id,
                      result: toolResult.result ? JSON.stringify(toolResult.result) : null,
                      success: toolResult.success,
                      error: toolResult.error,
                      responseTimestamp: toolResult.timestamp ? new Date(toolResult.timestamp) : null,
                    }
                  });
                }
              }
            }
          }
        }
      }

      // Create metadata record
      if (data.metadata) {
        await tx.conversationMetadata.create({
          data: {
            conversationId: conversation.id,
            startTimeUnixSecs: data.metadata.start_time_unix_secs,
            callDurationSecs: data.metadata.call_duration_secs,
            cost: data.metadata.cost,
            authorizationMethod: data.metadata.authorization_method,
            terminationReason: data.metadata.termination_reason,
            overallScore: data.metadata.feedback?.overall_score,
            likes: data.metadata.feedback?.likes || 0,
            dislikes: data.metadata.feedback?.dislikes || 0,
            devDiscount: data.metadata.charging?.dev_discount || false,
          }
        });
      }

      // Create analysis record
      if (data.analysis) {
        await tx.conversationAnalysis.create({
          data: {
            conversationId: conversation.id,
            evaluationCriteriaResults: data.analysis.evaluation_criteria_results ? 
              JSON.stringify(data.analysis.evaluation_criteria_results) : null,
            dataCollectionResults: data.analysis.data_collection_results ? 
              JSON.stringify(data.analysis.data_collection_results) : null,
            callSuccessful: data.analysis.call_successful,
            transcriptSummary: data.analysis.transcript_summary,
          }
        });
      }

      // Create initiation record
      if (data.conversation_initiation_client_data) {
        const initData = data.conversation_initiation_client_data;
        await tx.conversationInitiation.create({
          data: {
            conversationId: conversation.id,
            agentPrompt: initData.conversation_config_override?.agent?.prompt,
            agentFirstMessage: initData.conversation_config_override?.agent?.first_message,
            agentLanguage: initData.conversation_config_override?.agent?.language,
            ttsVoiceId: initData.conversation_config_override?.tts?.voice_id,
            customLlmExtraBody: initData.custom_llm_extra_body ? 
              JSON.stringify(initData.custom_llm_extra_body) : null,
            dynamicVariables: initData.dynamic_variables ? 
              JSON.stringify(initData.dynamic_variables) : null,
          }
        });
      }

      // Create deletion settings record
      if (data.metadata?.deletion_settings) {
        const delSettings = data.metadata.deletion_settings;
        await tx.conversationDeletionSettings.create({
          data: {
            conversationId: conversation.id,
            deletionTimeUnixSecs: delSettings.deletion_time_unix_secs,
            deletedLogsAtTimeUnixSecs: delSettings.deleted_logs_at_time_unix_secs,
            deletedAudioAtTimeUnixSecs: delSettings.deleted_audio_at_time_unix_secs,
            deletedTranscriptAtTimeUnixSecs: delSettings.deleted_transcript_at_time_unix_secs,
            deleteTranscriptAndPii: delSettings.delete_transcript_and_pii,
            deleteAudio: delSettings.delete_audio,
          }
        });
      }

      return conversation;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        conversationId: result.conversationId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error logging conversation:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 