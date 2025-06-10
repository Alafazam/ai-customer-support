import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ConversationsListResponse, ConversationSearchParams } from '@/types/conversation';

const prisma = new PrismaClient();

export async function POST(request: NextRequest): Promise<NextResponse<ConversationsListResponse & { analytics?: any }>> {
  try {
    const searchCriteria: ConversationSearchParams & {
      includeAnalytics?: boolean;
    } = await request.json();

    // Validate and set defaults
    const page = Math.max(1, searchCriteria.page || 1);
    const limit = Math.min(100, Math.max(1, searchCriteria.limit || 25));
    const skip = (page - 1) * limit;

    // Build complex where clause
    const where: any = {};

    if (searchCriteria.agentId) {
      where.agentId = searchCriteria.agentId;
    }

    if (searchCriteria.status) {
      where.status = searchCriteria.status;
    }

    if (searchCriteria.callSuccessful) {
      where.callSuccessful = searchCriteria.callSuccessful;
    }

    // Date range filtering
    if (searchCriteria.startDate || searchCriteria.endDate) {
      where.eventTimestamp = {};
      if (searchCriteria.startDate) {
        where.eventTimestamp.gte = new Date(searchCriteria.startDate);
      }
      if (searchCriteria.endDate) {
        where.eventTimestamp.lte = new Date(searchCriteria.endDate);
      }
    }

    // Duration filtering
    if (searchCriteria.minDuration || searchCriteria.maxDuration) {
      where.callDurationSecs = {};
      if (searchCriteria.minDuration) {
        where.callDurationSecs.gte = searchCriteria.minDuration;
      }
      if (searchCriteria.maxDuration) {
        where.callDurationSecs.lte = searchCriteria.maxDuration;
      }
    }

    // Cost filtering
    if (searchCriteria.minCost || searchCriteria.maxCost) {
      where.cost = {};
      if (searchCriteria.minCost) {
        where.cost.gte = searchCriteria.minCost;
      }
      if (searchCriteria.maxCost) {
        where.cost.lte = searchCriteria.maxCost;
      }
    }

    // Advanced text search
    if (searchCriteria.search) {
      where.OR = [
        {
          transcriptSummary: {
            contains: searchCriteria.search,
            mode: 'insensitive'
          }
        },
        {
          transcripts: {
            some: {
              message: {
                contains: searchCriteria.search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          conversationId: {
            contains: searchCriteria.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (searchCriteria.sortBy === 'eventTimestamp') {
      orderBy.eventTimestamp = searchCriteria.sortOrder || 'desc';
    } else if (searchCriteria.sortBy === 'callDurationSecs') {
      orderBy.callDurationSecs = searchCriteria.sortOrder || 'desc';
    } else if (searchCriteria.sortBy === 'cost') {
      orderBy.cost = searchCriteria.sortOrder || 'desc';
    } else {
      orderBy.eventTimestamp = 'desc';
    }

    // Execute main queries
    const [conversations, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          transcripts: {
            select: {
              id: true,
              role: true,
              timeInCallSecs: true,
            }
          },
          metadata: {
            select: {
              likes: true,
              dislikes: true,
              overallScore: true,
            }
          },
          _count: {
            select: {
              transcripts: true
            }
          }
        }
      }),
      prisma.conversation.count({ where })
    ]);

    // Transform conversation data
    const conversationSummaries = conversations.map(conv => ({
      id: conv.id,
      agentId: conv.agentId,
      conversationId: conv.conversationId,
      status: conv.status,
      eventTimestamp: conv.eventTimestamp,
      callDurationSecs: conv.callDurationSecs,
      cost: conv.cost,
      callSuccessful: conv.callSuccessful,
      transcriptSummary: conv.transcriptSummary,
      turnCount: conv._count.transcripts,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const response: any = {
      success: true,
      data: {
        conversations: conversationSummaries,
        totalCount,
        pagination: {
          page,
          limit,
          totalPages,
        }
      }
    };

    // Include analytics if requested
    if (searchCriteria.includeAnalytics && conversations.length > 0) {
      // Calculate analytics on the current result set
      const validDurations = conversations
        .map(c => c.callDurationSecs)
        .filter(d => d !== null) as number[];
      
      const validCosts = conversations
        .map(c => c.cost)
        .filter(c => c !== null) as number[];

      const successfulCalls = conversations.filter(c => c.callSuccessful === 'success').length;
      
      const totalLikes = conversations.reduce((sum, conv) => sum + (conv.metadata?.likes || 0), 0);
      const totalDislikes = conversations.reduce((sum, conv) => sum + (conv.metadata?.dislikes || 0), 0);
      
      const overallScores = conversations
        .map(c => c.metadata?.overallScore)
        .filter(score => score !== null) as number[];

      response.data.analytics = {
        averageDuration: validDurations.length > 0 ? 
          Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length) : 0,
        averageCost: validCosts.length > 0 ? 
          Math.round(validCosts.reduce((a, b) => a + b, 0) / validCosts.length) : 0,
        successRate: conversations.length > 0 ? 
          Math.round((successfulCalls / conversations.length) * 100) : 0,
        totalLikes,
        totalDislikes,
        averageRating: overallScores.length > 0 ? 
          Math.round((overallScores.reduce((a, b) => a + b, 0) / overallScores.length) * 10) / 10 : 0,
        agentDistribution: Object.entries(
          conversations.reduce((acc, conv) => {
            acc[conv.agentId] = (acc[conv.agentId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([agentId, count]) => ({ agentId, count })),
        statusDistribution: Object.entries(
          conversations.reduce((acc, conv) => {
            acc[conv.status] = (acc[conv.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([status, count]) => ({ status, count })),
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error searching conversations:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 