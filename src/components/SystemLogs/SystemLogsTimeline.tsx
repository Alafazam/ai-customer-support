import { SystemLog } from '@/types/issue';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronRight,
  Database,
  Globe,
  Bell,
  Cog
} from 'lucide-react';
import { formatDistanceToNow, formatDistanceStrict } from 'date-fns';

interface SystemLogsTimelineProps {
  logs: SystemLog[];
}

const getTypeIcon = (type: SystemLog['type']) => {
  switch (type) {
    case 'API_CALL':
      return <Globe className="h-4 w-4" />;
    case 'DATABASE':
      return <Database className="h-4 w-4" />;
    case 'NOTIFICATION':
      return <Bell className="h-4 w-4" />;
    case 'SERVICE':
      return <Cog className="h-4 w-4" />;
    default:
      return <ChevronRight className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: SystemLog['status']) => {
  switch (status) {
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
};

const getStatusColor = (status: SystemLog['status']) => {
  switch (status) {
    case 'error':
      return 'bg-red-50 border-red-100';
    case 'warning':
      return 'bg-yellow-50 border-yellow-100';
    case 'success':
      return 'bg-green-50 border-green-100';
  }
};

export default function SystemLogsTimeline({ logs }: SystemLogsTimelineProps) {
  // Sort logs by timestamp
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate the total duration of the process
  const startTime = new Date(sortedLogs[0]?.timestamp).getTime();
  const endTime = new Date(sortedLogs[sortedLogs.length - 1]?.timestamp).getTime();
  const totalDuration = endTime - startTime;

  return (
    <Card className="relative overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">System Logs Timeline</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Total Duration: {formatDistanceStrict(startTime, endTime)}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-4">
          {sortedLogs.map((log, index) => {
            const logTime = new Date(log.timestamp).getTime();
            const progress = ((logTime - startTime) / totalDuration) * 100;
            const hasNextLog = index < sortedLogs.length - 1;

            return (
              <div key={log.id} className="relative">
                {/* Timeline line */}
                {hasNextLog && (
                  <div 
                    className="absolute left-6 top-10 bottom-0 w-0.5 bg-border"
                    style={{ left: '1.5rem' }}
                  />
                )}

                {/* Log entry */}
                <div className={`
                  relative flex gap-4 p-4 rounded-lg border
                  ${getStatusColor(log.status)}
                `}>
                  {/* Type icon */}
                  <div className="mt-1">
                    {getTypeIcon(log.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{log.name}</h4>
                          {getStatusIcon(log.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.summary}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp))} ago
                        </div>
                        {log.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {log.duration}ms
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {log.metadata && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {log.metadata.endpoint && (
                            <div>
                              <span className="text-muted-foreground">Endpoint: </span>
                              <span className="font-mono">{log.metadata.endpoint}</span>
                            </div>
                          )}
                          {log.metadata.method && (
                            <div>
                              <span className="text-muted-foreground">Method: </span>
                              <span className="font-mono">{log.metadata.method}</span>
                            </div>
                          )}
                          {log.metadata.statusCode && (
                            <div>
                              <span className="text-muted-foreground">Status: </span>
                              <span className="font-mono">{log.metadata.statusCode}</span>
                            </div>
                          )}
                          {log.metadata.service && (
                            <div>
                              <span className="text-muted-foreground">Service: </span>
                              <span>{log.metadata.service}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Details */}
                    <div className="mt-2 p-2 bg-background rounded-md">
                      <pre className="text-xs whitespace-pre-wrap">
                        {log.details}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(log.logUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Log
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute left-0 top-6">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
} 