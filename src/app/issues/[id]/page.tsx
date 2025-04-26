'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import { 
  Download,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SystemLogsTimeline from '@/components/SystemLogs/SystemLogsTimeline';
import issuesData from '@/data/issues.json';
import { Issue } from '@/types/issue';

export default function IssuePage({ params }: { params: { id: string } }) {
  const [issue, setIssue] = useState<Issue | null>(null);

  useEffect(() => {
    const foundIssue = issuesData.issues.find(i => i.id === params.id);
    if (foundIssue) {
      setIssue(foundIssue as Issue);
    }
  }, [params.id]);

  if (!issue) {
    return <div>Loading...</div>;
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 pt-24">
        {/* Issue Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{issue.title}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{issue.id}</Badge>
              <Badge className={getStatusColor(issue.status)}>
                {issue.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{issue.description}</p>
                </div>
                {issue.aiSummary && (
                  <div>
                    <h3 className="font-medium mb-2">AI Summary</h3>
                    <p className="text-muted-foreground">{issue.aiSummary}</p>
                  </div>
                )}
                {issue.technicalRca && (
                  <div>
                    <h3 className="font-medium mb-2">Technical Root Cause Analysis</h3>
                    <p className="text-muted-foreground">{issue.technicalRca}</p>
                  </div>
                )}
                {issue.customerRca && (
                  <div>
                    <h3 className="font-medium mb-2">Customer Communication RCA</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground">{issue.customerRca}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Logs Timeline */}
            {issue.systemLogs && issue.systemLogs.length > 0 && (
              <SystemLogsTimeline logs={issue.systemLogs} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{issue.customer.email}</span>
                </div>
                {issue.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{issue.customer.phone}</span>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  {issue.type && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{issue.type}</span>
                    </div>
                  )}
                  {issue.channel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Channel:</span>
                      <span>{issue.channel}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assignee:</span>
                    <span>{issue.assignee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Information */}
            <Card>
              <CardHeader>
                <CardTitle>SLA Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {issue.firstResponseTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">First Response:</span>
                      <span>{issue.firstResponseTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span>{issue.responseTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SLA Status:</span>
                    <Badge variant={issue.slaStatus === 'within_limit' ? 'default' : 'destructive'}>
                      {issue.slaStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {issue.attachments && issue.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {issue.attachments.map((attachment) => (
                      <div
                        key={attachment.name}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{attachment.size}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {issue.actions && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* RCA Generation Section */}
                  {issue.technicalRca && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">RCA Status</span>
                        <Badge variant={issue.customerRca ? "default" : "secondary"}>
                          {issue.customerRca ? "Generated" : "Pending"}
                        </Badge>
                      </div>
                      {issue.actions.canGenerateRca && !issue.customerRca && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white" 
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/issues/generate-rca', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  issueId: issue.id,
                                  technicalRca: issue.technicalRca,
                                  systemLogs: issue.systemLogs
                                }),
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to generate RCA');
                              }
                              
                              const data = await response.json();
                              setIssue(prev => prev ? {
                                ...prev,
                                customerRca: data.customerRca
                              } : null);
                            } catch (error) {
                              console.error('Error generating RCA:', error);
                              // You might want to show an error toast here
                            }
                          }}
                        >
                          Generate Customer RCA
                        </Button>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Other Actions */}
                  {issue.actions.canSendResponse && (
                    <Button className="w-full" variant="default">
                      Send Response
                    </Button>
                  )}
                  {issue.actions.canCreateOIM && (
                    <Button className="w-full" variant="outline">
                      Create OIM
                    </Button>
                  )}
                  {issue.actions.canCreateOIIM && (
                    <Button className="w-full" variant="outline">
                      Create OIIM
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 