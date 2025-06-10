'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Navbar from '@/components/Navbar/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  MessageSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Star,
  ThumbsUp,
  Settings,
  BarChart3,
  RefreshCcw
} from 'lucide-react';

// Types
interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  completedConversations: number;
  failedConversations: number;
  averageDuration: number;
  averageCost: number;
  successRate: number;
  averageRating: number;
  customerSatisfaction: number;
  toolUsageRate: number;
  averageResponseTime: number;
  slaAdherence: number;
}

interface AgentPerformance {
  agentId: string;
  totalConversations: number;
  successRate: number;
  avgDuration: number;
  avgCost: number;
  avgRating: number;
  toolCalls: number;
}

interface TrendDataPoint {
  date: string;
  conversationVolume: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface DashboardData {
  overview: DashboardMetrics;
  agentPerformance: AgentPerformance[];
  statusDistribution: StatusDistribution[];
  callSuccessDistribution: StatusDistribution[];
  trends: {
    conversationVolume: TrendDataPoint[];
  };
}

interface RecentConversation {
  id: string;
  agentId: string;
  conversationId: string;
  status: string;
  callDurationSecs: number;
  cost: number;
  callSuccessful: string;
  eventTimestamp: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Chart configuration
const chartConfig = {
  conversationVolume: {
    label: "Conversations",
    color: "hsl(var(--chart-1))",
  },
  successRate: {
    label: "Success Rate %",
    color: "hsl(var(--chart-2))",
  },
  duration: {
    label: "Duration (min)",
    color: "hsl(var(--chart-3))",
  },
  cost: {
    label: "Cost ($)",
    color: "hsl(var(--chart-4))",
  },
};

// Pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ConversationDashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard analytics
  const { data: dashboardData, error: dashboardError, mutate: mutateDashboard } = useSWR<{ success: boolean; data: DashboardData }>(
    `/api/conversations/analytics/dashboard?timeRange=${timeRange}${selectedAgentId ? `&agentId=${selectedAgentId}` : ''}&refresh=${refreshKey}`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch recent conversations
  const { data: conversationsData, error: conversationsError } = useSWR<{ success: boolean; data: { conversations: RecentConversation[] } }>(
    `/api/conversations?limit=10&sortBy=eventTimestamp&sortOrder=desc`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    mutateDashboard();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatCost = (cost: number) => {
    return `$${(cost / 100).toFixed(2)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessColor = (success: string) => {
    switch (success?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const metrics = dashboardData?.data?.overview;
  const agentPerformance = dashboardData?.data?.agentPerformance || [];
  const recentConversations = conversationsData?.data?.conversations || [];
  const statusDistribution = dashboardData?.data?.statusDistribution || [];
  const trendData = dashboardData?.data?.trends?.conversationVolume || [];

  const loading = !dashboardData && !dashboardError;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Conversation Analytics</h1>
            <p className="text-muted-foreground">Monitor AI conversation performance and metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Row 1 - Volume Metrics */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalConversations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Conversations</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeConversations || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.completedConversations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.totalConversations ? Math.round((metrics.completedConversations / metrics.totalConversations) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.failedConversations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.totalConversations ? Math.round((metrics.failedConversations / metrics.totalConversations) * 100) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              {/* Row 2 - Performance Metrics */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(metrics?.averageDuration || 0)}</div>
                  <p className="text-xs text-muted-foreground">Per conversation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCost(metrics?.averageCost || 0)}</div>
                  <p className="text-xs text-muted-foreground">Per conversation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.successRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Successful conversations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.averageRating || 0}/5</div>
                  <p className="text-xs text-muted-foreground">Customer feedback</p>
                </CardContent>
              </Card>

              {/* Row 3 - Quality Metrics */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.customerSatisfaction || 0}%</div>
                  <p className="text-xs text-muted-foreground">Likes vs dislikes ratio</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tool Usage</CardTitle>
                  <Settings className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.toolUsageRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Conversations with tools</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(metrics?.averageResponseTime || 0)}</div>
                  <p className="text-xs text-muted-foreground">Time to first response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">SLA Adherence</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.slaAdherence || 0}%</div>
                  <p className="text-xs text-muted-foreground">Under 5 minutes</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Conversation Volume Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Volume Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="conversationVolume" 
                        stroke="var(--color-conversationVolume)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Agent Performance Section */}
            {agentPerformance.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent ID</TableHead>
                          <TableHead>Total Conversations</TableHead>
                          <TableHead>Success Rate</TableHead>
                          <TableHead>Avg Duration</TableHead>
                          <TableHead>Avg Cost</TableHead>
                          <TableHead>Avg Rating</TableHead>
                          <TableHead>Tool Calls</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentPerformance.map((agent: AgentPerformance) => (
                          <TableRow key={agent.agentId}>
                            <TableCell className="font-medium">{agent.agentId}</TableCell>
                            <TableCell>{agent.totalConversations}</TableCell>
                            <TableCell>{agent.successRate}%</TableCell>
                            <TableCell>{formatDuration(agent.avgDuration)}</TableCell>
                            <TableCell>{formatCost(agent.avgCost)}</TableCell>
                            <TableCell>{agent.avgRating}/5</TableCell>
                            <TableCell>{agent.toolCalls}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conversation ID</TableHead>
                        <TableHead>Agent ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentConversations.map((conversation: RecentConversation) => (
                        <TableRow key={conversation.id}>
                          <TableCell className="font-medium">
                            <Button 
                              variant="link" 
                              className="h-auto p-0"
                              onClick={() => window.open(`/api/conversations/${conversation.id}`, '_blank')}
                            >
                              {conversation.conversationId}
                            </Button>
                          </TableCell>
                          <TableCell>{conversation.agentId}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(conversation.status)}>
                              {conversation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDuration(conversation.callDurationSecs || 0)}</TableCell>
                          <TableCell>{formatCost(conversation.cost || 0)}</TableCell>
                          <TableCell>
                            <Badge className={getSuccessColor(conversation.callSuccessful)}>
                              {conversation.callSuccessful || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTimestamp(conversation.eventTimestamp)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
} 