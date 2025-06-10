import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ConversationsListResponse, ConversationSearchParams } from '@/types/conversation';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse<ConversationsListResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: ConversationSearchParams = {
      agentId: searchParams.get('agentId') || undefined,
      status: searchParams.get('status') || undefined,
      callSuccessful: searchParams.get('callSuccessful') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minDuration: searchParams.get('minDuration') ? parseInt(searchParams.get('minDuration')!) : undefined,
      maxDuration: searchParams.get('maxDuration') ? parseInt(searchParams.get('maxDuration')!) : undefined,
      minCost: searchParams.get('minCost') ? parseInt(searchParams.get('minCost')!) : undefined,
      maxCost: searchParams.get('maxCost') ? parseInt(searchParams.get('maxCost')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 25,
      sortBy: (searchParams.get('sortBy') as any) || 'eventTimestamp',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate pagination parameters
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (params.agentId) {
      where.agentId = params.agentId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.callSuccessful) {
      where.callSuccessful = params.callSuccessful;
    }

    if (params.startDate || params.endDate) {
      where.eventTimestamp = {};
      if (params.startDate) {
        where.eventTimestamp.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.eventTimestamp.lte = new Date(params.endDate);
      }
    }

    if (params.minDuration || params.maxDuration) {
      where.callDurationSecs = {};
      if (params.minDuration) {
        where.callDurationSecs.gte = params.minDuration;
      }
      if (params.maxDuration) {
        where.callDurationSecs.lte = params.maxDuration;
      }
    }

    if (params.minCost || params.maxCost) {
      where.cost = {};
      if (params.minCost) {
        where.cost.gte = params.minCost;
      }
      if (params.maxCost) {
        where.cost.lte = params.maxCost;
      }
    }

    // Search in transcript summary or conversation messages
    if (params.search) {
      where.OR = [
        {
          transcriptSummary: {
            contains: params.search,
            mode: 'insensitive'
          }
        },
        {
          transcripts: {
            some: {
              message: {
                contains: params.search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (params.sortBy === 'eventTimestamp') {
      orderBy.eventTimestamp = params.sortOrder;
    } else if (params.sortBy === 'callDurationSecs') {
      orderBy.callDurationSecs = params.sortOrder;
    } else if (params.sortBy === 'cost') {
      orderBy.cost = params.sortOrder;
    } else {
      orderBy.eventTimestamp = 'desc';
    }

    // Execute queries in parallel
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

    // Transform the data
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

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 