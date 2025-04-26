import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import omniCims from '@/data/omni-order-cims.json';
import omniOms from '@/data/omni-order-oms.json';
import omniWms from '@/data/omni-order-wms.json';

const SYSTEMS = [
  {
    key: 'cims',
    label: 'CIMS',
    color: 'bg-blue-50 border-blue-100',
    data: omniCims,
  },
  {
    key: 'oms',
    label: 'OMS',
    color: 'bg-green-50 border-green-100',
    data: omniOms,
  },
  {
    key: 'wms',
    label: 'WMS',
    color: 'bg-yellow-50 border-yellow-100',
    data: omniWms,
  },
];

type DrawerContent = {
  system: string;
  type: 'order' | 'order_items';
  data: unknown;
};

function OmniOrderLogsTimeline() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(null);

  const openDrawer = (system: string, type: 'order' | 'order_items', data: unknown) => {
    setDrawerContent({ system, type, data });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setDrawerContent(null), 200);
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center space-y-8 py-8">
        {SYSTEMS.map((sys, idx) => (
          <div key={sys.key} className="relative flex items-center w-full max-w-2xl mx-auto">
            {/* Timeline line */}
            {idx < SYSTEMS.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" style={{ left: '1.5rem', top: '3rem' }} />
            )}
            {/* Timeline node */}
            <div className={`flex gap-4 p-6 rounded-lg border w-full ${sys.color}`}>
              <div className="mt-1">
                <Badge variant="secondary" className="text-base px-3 py-2">{sys.label}</Badge>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-xs">
                    {(() => {
                      if (sys.key === 'cims') {
                        return (sys.data.order as { channel_order_status?: string })?.channel_order_status || 'Unknown';
                      } else if (sys.key === 'oms') {
                        return (sys.data.order as { status?: string })?.status || 'Unknown';
                      } else if (sys.key === 'wms') {
                        return (sys.data.order as { order_state?: string })?.order_state || 'Unknown';
                      } else {
                        return 'Unknown';
                      }
                    })()}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDrawer(sys.label, 'order', sys.data.order)}
                    className="flex items-center gap-2"
                  >
                    View Order Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDrawer(sys.label, 'order_items', sys.data.order_items)}
                    className="flex items-center gap-2"
                  >
                    View Order Item Data
                  </Button>
                </div>
              </div>
            </div>
            {/* Progress indicator */}
            <div className="absolute left-0 top-8">
              <Badge variant="outline" className="text-xs" style={{ transform: 'translateX(-50%)' }}>{idx + 1}</Badge>
            </div>
          </div>
        ))}
      </div>
      {/* Drawer/Modal for details */}
      {drawerOpen && drawerContent && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="relative ml-auto w-full max-w-2xl bg-white h-full shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="font-semibold">
                {drawerContent.system} {drawerContent.type === 'order' ? 'Order Data' : 'Order Item Data'}
              </h4>
              <Button variant="ghost" size="sm" onClick={closeDrawer}>Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(drawerContent.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OmniOrderLogsTimeline; 