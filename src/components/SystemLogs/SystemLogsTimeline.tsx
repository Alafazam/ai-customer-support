import { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { formatDistanceStrict, format } from 'date-fns';
import { mockSystemLogs, generateLogCSV } from '@/data/mockSystemLogs';
import OmniOrderLogsTimeline from './OmniOrderLogsTimeline';

const logs = mockSystemLogs.map((log) => ({
  id: log.id,
  type: 'API_CALL',
  status: log.status === 'SUCCESS' ? 'success' : 'error',
  name: log.apiName,
  method: log.method,
  url: log.url,
  channel: log.channel,
  timestamp: log.timestamp,
  duration: log.duration,
  log: log,
}));

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'error':
      return 'bg-red-50 border-red-100';
    case 'warning':
      return 'bg-yellow-50 border-yellow-100';
    case 'success':
      return 'bg-green-50 border-green-100';
  }
};

export default function SystemLogsTimeline() {
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSection, setOpenSection] = useState<'system' | 'omni' | 'audit' | null>('system');

  // Prevent parent scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [drawerOpen]);

  // Sort logs by timestamp
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate the total duration of the process
  const startTime = new Date(sortedLogs[0]?.timestamp).getTime();
  const endTime = new Date(sortedLogs[sortedLogs.length - 1]?.timestamp).getTime();

  // Download CSV for a log
  const handleDownload = (log: typeof logs[0]) => {
    const csv = generateLogCSV(log.log);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${log.name.replace(/\s+/g, '_')}_${log.id}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Calculate time between calls
  const getTimeBetween = (prev: string, curr: string) => {
    const prevTime = new Date(prev).getTime();
    const currTime = new Date(curr).getTime();
    return currTime - prevTime;
  };

  // Accordion section header
  const SectionHeader = ({ label, section, extra }: { label: string; section: typeof openSection, extra?: React.ReactNode }) => (
    <button
      className={`w-full flex items-center justify-between px-4 py-3 text-lg font-semibold bg-muted/60 border-b hover:bg-muted transition-colors ${openSection === section ? 'rounded-t-lg' : 'rounded-lg'}`}
      onClick={() => setOpenSection(openSection === section ? null : section)}
      type="button"
    >
      <span className="flex items-center gap-3">
        {label}
        {openSection === section && extra}
      </span>
      <span className="ml-2">{openSection === section ? '−' : '+'}</span>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* System Logs Timeline Section */}
      <Card className="overflow-hidden">
        <SectionHeader 
          label="System Logs Timeline" 
          section="system"
          extra={
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Total Duration: {formatDistanceStrict(startTime, endTime)}
            </span>
          }
        />
        {openSection === 'system' && (
          <>
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-8">
                {sortedLogs.map((log, index) => {
                  const hasNextLog = index < sortedLogs.length - 1;
                  const prevLog = index > 0 ? sortedLogs[index - 1] : null;
                  const timeBetween = prevLog ? getTimeBetween(prevLog.timestamp, log.timestamp) : 0;
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
                        {/* Status icon */}
                        <div className="mt-1">
                          {getStatusIcon(log.status)}
                        </div>
                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium text-base">{log.name}</h4>
                            <Badge variant="outline" className="text-xs font-mono">{log.method}</Badge>
                            <span className="text-xs text-muted-foreground break-all font-mono">{log.url}</span>
                            <Badge variant="secondary" className="text-xs">{log.channel}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span>Time: {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                            <span>Duration: <b>{log.duration}ms</b></span>
                            {prevLog && (
                              <span>+{timeBetween}ms since last call</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedLog(log); setDrawerOpen(true); }}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(log)}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download Log CSV
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
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
        {/* Drawer/Modal for details */}
        {drawerOpen && selectedLog && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-xl flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-semibold">Log Details</h4>
                <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Close</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="font-semibold mb-1">API Name</div>
                  <div className="font-mono text-sm break-all">{selectedLog.name}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Method</div>
                  <div className="font-mono text-sm">{selectedLog.method}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">URL</div>
                  <div className="font-mono text-xs break-all">{selectedLog.url}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Channel</div>
                  <div className="font-mono text-sm">{selectedLog.channel}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Status</div>
                  <div className="font-mono text-sm">{selectedLog.status}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Timestamp</div>
                  <div className="font-mono text-xs">{format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss')}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Duration</div>
                  <div className="font-mono text-sm">{selectedLog.duration}ms</div>
                </div>
                <Separator />
                <div>
                  <div className="font-semibold mb-1">Request</div>
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(JSON.parse(selectedLog.log.requestBody), null, 2)}</pre>
                </div>
                <div>
                  <div className="font-semibold mb-1">Response</div>
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedLog.log.responseBody);
                        // If error field is a stringified JSON, try to parse it
                        if (parsed && typeof parsed.error === 'string') {
                          try {
                            const errorObj = JSON.parse(parsed.error);
                            return JSON.stringify({ ...parsed, error: errorObj }, null, 2);
                          } catch {
                            // Not a JSON string, just show as is
                            return JSON.stringify(parsed, null, 2);
                          }
                        }
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return selectedLog.log.responseBody;
                      }
                    })()}
                  </pre>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedLog)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Log CSV
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
      {/* Omni Order Logs Section */}
      <Card className="overflow-hidden">
        <SectionHeader label="Omni Order Logs" section="omni" />
        {openSection === 'omni' && (
          <OmniOrderLogsTimeline />
        )}
      </Card>
      {/* Order Audits Section */}
      <Card className="overflow-hidden">
        <SectionHeader label="Order Audits" section="audit" />
        {openSection === 'audit' && (
          <div className="p-6 text-muted-foreground text-center">Order Audits content goes here.</div>
        )}
      </Card>
    </div>
  );
} 