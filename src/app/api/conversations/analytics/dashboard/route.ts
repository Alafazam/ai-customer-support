import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        const customStart = searchParams.get('startDate');
        const customEnd = searchParams.get('endDate');
        startDate = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // For custom range, we'd also use endDate but keeping it simple for now
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build where clause
    const whereClause: any = {
      eventTimestamp: {
        gte: startDate
      }
    };

    if (agentId) {
      whereClause.agentId = agentId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get conversation counts by status
    const [
      totalConversations,
      activeConversations, 
      completedConversations,
      failedConversations,
      conversations
    ] = await Promise.all([
      // Total conversations
      prisma.conversation.count({ where: whereClause }),
      
      // Active conversations (in_progress status)
      prisma.conversation.count({ 
        where: { ...whereClause, status: 'in_progress' }
      }),
      
      // Completed conversations (done status)
      prisma.conversation.count({ 
        where: { ...whereClause, status: 'done' }
      }),
      
      // Failed conversations
      prisma.conversation.count({ 
        where: { 
          ...whereClause, 
          OR: [
            { status: 'failed' },
            { status: 'error' },
            { callSuccessful: 'failure' }
          ]
        }
      }),
      
      // Get all conversations with metadata for calculations
      prisma.conversation.findMany({
        where: whereClause,
        include: {
          metadata: true,
          transcripts: {
            include: {
              toolCalls: true
            }
          }
        }
      })
    ]);

    // Calculate metrics
    const conversationsWithDuration = conversations.filter(c => c.callDurationSecs && c.callDurationSecs > 0);
    const conversationsWithCost = conversations.filter(c => c.cost && c.cost > 0);
    const conversationsWithRating = conversations.filter(c => c.metadata?.overallScore);
    const conversationsWithFeedback = conversations.filter(c => c.metadata && (c.metadata.likes > 0 || c.metadata.dislikes > 0));
    const conversationsWithTools = conversations.filter(c => c.transcripts.some(t => t.toolCalls.length > 0));
    const successfulConversations = conversations.filter(c => c.callSuccessful === 'success');

    const averageDuration = conversationsWithDuration.length > 0 
      ? Math.round(conversationsWithDuration.reduce((sum, c) => sum + (c.callDurationSecs || 0), 0) / conversationsWithDuration.length)
      : 0;

    const averageCost = conversationsWithCost.length > 0
      ? Math.round(conversationsWithCost.reduce((sum, c) => sum + (c.cost || 0), 0) / conversationsWithCost.length)
      : 0;

    const successRate = totalConversations > 0 
      ? Math.round((successfulConversations.length / totalConversations) * 100 * 10) / 10
      : 0;

    const averageRating = conversationsWithRating.length > 0
      ? Math.round(conversationsWithRating.reduce((sum, c) => sum + (c.metadata?.overallScore || 0), 0) / conversationsWithRating.length * 10) / 10
      : 0;

    const totalLikes = conversations.reduce((sum, c) => sum + (c.metadata?.likes || 0), 0);
    const totalDislikes = conversations.reduce((sum, c) => sum + (c.metadata?.dislikes || 0), 0);
    const customerSatisfaction = (totalLikes + totalDislikes) > 0 
      ? Math.round((totalLikes / (totalLikes + totalDislikes)) * 100 * 10) / 10
      : 0;

    const toolUsageRate = totalConversations > 0
      ? Math.round((conversationsWithTools.length / totalConversations) * 100 * 10) / 10
      : 0;

    // Calculate average response time (time to first agent message)
    const averageResponseTime = conversations.length > 0
      ? Math.round(conversations.reduce((sum, c) => {
          const firstAgentMessage = c.transcripts
            .filter(t => t.role === 'agent')
            .sort((a, b) => (a.timeInCallSecs || 0) - (b.timeInCallSecs || 0))[0];
          return sum + (firstAgentMessage?.timeInCallSecs || 0);
        }, 0) / conversations.length)
      : 0;

    // Simple SLA adherence calculation (conversations under 5 minutes)
    const slaThreshold = 300; // 5 minutes in seconds
    const slaCompliantConversations = conversationsWithDuration.filter(c => (c.callDurationSecs || 0) <= slaThreshold);
    const slaAdherence = conversationsWithDuration.length > 0
      ? Math.round((slaCompliantConversations.length / conversationsWithDuration.length) * 100 * 10) / 10
      : 0;

    // Get agent performance data
    const agentStats = await prisma.conversation.groupBy({
      by: ['agentId'],
      where: whereClause,
      _count: {
        id: true
      },
      _avg: {
        callDurationSecs: true,
        cost: true
      }
    });

    const agentPerformance = await Promise.all(
      agentStats.map(async (agent) => {
        const agentConversations = conversations.filter(c => c.agentId === agent.agentId);
        const agentSuccessful = agentConversations.filter(c => c.callSuccessful === 'success');
        const agentWithRating = agentConversations.filter(c => c.metadata?.overallScore);
        const agentWithTools = agentConversations.filter(c => c.transcripts.some(t => t.toolCalls.length > 0));
        
        return {
          agentId: agent.agentId,
          totalConversations: agent._count.id,
          successRate: agentConversations.length > 0 
            ? Math.round((agentSuccessful.length / agentConversations.length) * 100 * 10) / 10
            : 0,
          avgDuration: Math.round(agent._avg.callDurationSecs || 0),
          avgCost: Math.round(agent._avg.cost || 0),
          avgRating: agentWithRating.length > 0
            ? Math.round(agentWithRating.reduce((sum, c) => sum + (c.metadata?.overallScore || 0), 0) / agentWithRating.length * 10) / 10
            : 0,
          toolCalls: agentWithTools.reduce((sum, c) => sum + c.transcripts.reduce((tSum, t) => tSum + t.toolCalls.length, 0), 0)
        };
      })
    );

    // Get status distribution
    const statusDistribution = await prisma.conversation.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    const callSuccessDistribution = await prisma.conversation.groupBy({
      by: ['callSuccessful'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // Generate trend data (simplified - daily counts for the period)
    const trendData = [];
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayConversations = await prisma.conversation.count({
        where: {
          ...whereClause,
          eventTimestamp: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      });
      
      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        conversationVolume: dayConversations
      });
    }

    const responseData = {
      success: true,
      data: {
        overview: {
          totalConversations,
          activeConversations,
          completedConversations,
          failedConversations,
          averageDuration,
          averageCost,
          successRate,
          averageRating,
          customerSatisfaction,
          toolUsageRate,
          averageResponseTime,
          slaAdherence
        },
        trends: {
          conversationVolume: trendData
        },
        agentPerformance,
        statusDistribution: statusDistribution.map(s => ({
          status: s.status,
          count: s._count.id
        })),
        callSuccessDistribution: callSuccessDistribution.map(s => ({
          status: s.callSuccessful || 'unknown',
          count: s._count.id
        }))
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
} 