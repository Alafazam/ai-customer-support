'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Issue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved';
  customer: string;
  timestamp: string;
}

const dummyIssues: Issue[] = [
  {
    id: 'ISSUE-001',
    title: 'Cannot access my account',
    status: 'open',
    customer: 'John Doe',
    timestamp: '2024-03-15 10:30 AM'
  },
  {
    id: 'ISSUE-002',
    title: 'Payment failed multiple times',
    status: 'in_progress',
    customer: 'Jane Smith',
    timestamp: '2024-03-15 09:15 AM'
  },
  {
    id: 'ISSUE-003',
    title: 'Product delivery delayed',
    status: 'resolved',
    customer: 'Mike Johnson',
    timestamp: '2024-03-14 04:45 PM'
  }
];

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    setIssues(dummyIssues);
  }, []);

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Issues Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and track customer support tickets</p>
          </div>
        </div>

        <div className="grid gap-4">
          {issues.map((issue) => (
            <Card key={issue.id} className="hover:bg-accent/5 transition-colors">
              <CardHeader className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{issue.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Reported by {issue.customer} • {issue.timestamp}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(issue.status)}>
                    {getStatusText(issue.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">ID:</span> {issue.id}
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