'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Clock,
  Search,
  Timer,
  TrendingUp,
  Users
} from 'lucide-react';
import issuesData from '@/data/issues.json';
import { useRouter } from 'next/navigation';

// Types
interface Metrics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  averageResponseTime: string;
  slaAdherence: number;
  criticalIssues: number;
  customerSatisfaction: number;
}

interface Customer {
  name: string;
  email: string;
}

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  customer: Customer;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  responseTime: string;
  slaStatus: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics] = useState<Metrics>(issuesData.metrics);
  const [issues] = useState<Issue[]>(issuesData.issues);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>(issues);

  useEffect(() => {
    const filtered = issues.filter(issue => 
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredIssues(filtered);
  }, [searchQuery, issues]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const handleIssueClick = (issueId: string) => {
    router.replace(`/issues/${issueId}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-8">
        {/* Metrics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Support Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openIssues}</div>
                <p className="text-xs text-muted-foreground">
                  {((metrics.openIssues / metrics.totalIssues) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">SLA Adherence</CardTitle>
                <Timer className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.slaAdherence}%</div>
                <p className="text-xs text-muted-foreground">Average response time: {metrics.averageResponseTime}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((metrics.resolvedIssues / metrics.totalIssues) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">{metrics.resolvedIssues} issues resolved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.customerSatisfaction}/5.0</div>
                <p className="text-xs text-muted-foreground">Based on customer feedback</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues by ID, title, or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[300px]"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow 
                  key={issue.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleIssueClick(issue.id)}
                >
                  <TableCell className="font-medium">{issue.id}</TableCell>
                  <TableCell>{issue.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{issue.customer.name}</TableCell>
                  <TableCell>{issue.assignee}</TableCell>
                  <TableCell>{formatDate(issue.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {issue.responseTime}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredIssues.map((issue) => (
            <Card 
              key={issue.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => handleIssueClick(issue.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">{issue.id}</p>
                    <h3 className="font-semibold">{issue.title}</h3>
                  </div>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span>{issue.customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assignee:</span>
                    <span>{issue.assignee}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(issue.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {issue.responseTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
} 