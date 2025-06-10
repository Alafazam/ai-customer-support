import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ConversationDetailResponse } from '@/types/conversation';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ConversationDetailResponse>> {
  try {
    const conversationId = params.id;

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'Conversation ID is required'
      }, { status: 400 });
    }

    // Fetch conversation with all related data
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        transcripts: {
          include: {
            toolCalls: {
              include: {
                results: true
              }
            },
            toolResults: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        metadata: true,
        analysis: true,
        initiation: true,
        deletionSettings: true
      }
    });

    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }

    // Transform the data to match our response interface
    const conversationDetail = {
      id: conversation.id,
      agentId: conversation.agentId,
      conversationId: conversation.conversationId,
      status: conversation.status,
      eventTimestamp: conversation.eventTimestamp,
      callDurationSecs: conversation.callDurationSecs,
      cost: conversation.cost,
      callSuccessful: conversation.callSuccessful,
      transcriptSummary: conversation.transcriptSummary,
      transcripts: conversation.transcripts.map(transcript => ({
        id: transcript.id,
        role: transcript.role,
        message: transcript.message,
        timeInCallSecs: transcript.timeInCallSecs,
        feedback: transcript.feedback,
        toolCalls: transcript.toolCalls.map(toolCall => ({
          id: toolCall.id,
          toolName: toolCall.toolName,
          toolFunction: toolCall.toolFunction,
          parameters: toolCall.parameters ? JSON.parse(toolCall.parameters) : null,
          callTimestamp: toolCall.callTimestamp,
        })),
        toolResults: transcript.toolResults.map(toolResult => ({
          id: toolResult.id,
          result: toolResult.result ? JSON.parse(toolResult.result) : null,
          success: toolResult.success,
          error: toolResult.error,
          responseTimestamp: toolResult.responseTimestamp,
        }))
      })),
      metadata: conversation.metadata ? {
        startTimeUnixSecs: conversation.metadata.startTimeUnixSecs,
        callDurationSecs: conversation.metadata.callDurationSecs,
        cost: conversation.metadata.cost,
        overallScore: conversation.metadata.overallScore,
        likes: conversation.metadata.likes,
        dislikes: conversation.metadata.dislikes,
        devDiscount: conversation.metadata.devDiscount,
      } : null,
      analysis: conversation.analysis ? {
        evaluationCriteriaResults: conversation.analysis.evaluationCriteriaResults ? 
          JSON.parse(conversation.analysis.evaluationCriteriaResults) : null,
        dataCollectionResults: conversation.analysis.dataCollectionResults ? 
          JSON.parse(conversation.analysis.dataCollectionResults) : null,
        callSuccessful: conversation.analysis.callSuccessful,
        transcriptSummary: conversation.analysis.transcriptSummary,
      } : null,
      initiation: conversation.initiation ? {
        agentPrompt: conversation.initiation.agentPrompt,
        agentFirstMessage: conversation.initiation.agentFirstMessage,
        agentLanguage: conversation.initiation.agentLanguage,
        ttsVoiceId: conversation.initiation.ttsVoiceId,
        customLlmExtraBody: conversation.initiation.customLlmExtraBody ? 
          JSON.parse(conversation.initiation.customLlmExtraBody) : null,
        dynamicVariables: conversation.initiation.dynamicVariables ? 
          JSON.parse(conversation.initiation.dynamicVariables) : null,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: conversationDetail
    });

  } catch (error) {
    console.error('Error fetching conversation details:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 