// Mock system logs data based on ELK logs CSV structure
export interface MockSystemLog {
  id: string;
  apiName: string;
  method: string;
  url: string;
  status: string;
  duration: number;
  timestamp: string;
  requestBody: string;
  responseBody: string;
  httpStatus: string;
  channel: string;
  raw: Record<string, unknown>;
}

export const mockSystemLogs: MockSystemLog[] = [
  {
    id: '1',
    apiName: 'Fetch Orders',
    method: 'GET',
    url: 'http://assure-proxy.increff.com/flipkartv3/orders/get-orders?lastFetchedTime=2025-04-03T07:01:53%2B05:30&locationCode=LOCc49f5ba19472455e98c0a23747012805',
    status: 'SUCCESS',
    duration: 268,
    timestamp: '2025-04-26T06:20:55.384Z',
    requestBody: '{"credentials":{"SPLIT_INVOICE_LABEL":"True","PASSWORD":"38139caeb6f80153565179d105978cf4d","USER_ID":"1a0345233a52482b96405102242ba5a118907","USE_NEW_INVOICE_TEMPLATE":"True","IS_INCREFF_MANAGED":"TRUE","SELLER_CODE":"eeac0345-02ac-4c5f-a6b2-97d2bc4da6ec"}}',
    responseBody: '{"lastFetchedTime":"2025-04-03T06:59:53+05:30","locationCode":"LOCc49f5ba19472455e98c0a23747012805","orderList":[]}',
    httpStatus: '200',
    channel: 'Flipkart',
    raw: {},
  },
  {
    id: '2',
    apiName: 'Fetch Orders (Outbound)',
    method: 'POST',
    url: 'https://api.flipkart.net/sellers/v3/shipments/filter',
    status: 'SUCCESS',
    duration: 49,
    timestamp: '2025-04-26T06:20:56.000Z',
    requestBody: '{"filter":{"states":["APPROVED"],"type":"preDispatch","locationId":"LOCfb9df29fac4d43bf9b6ddfb7f0c80f43","orderDate":{"from":"2003-07-02T08:58:02+05:30","to":"2025-04-26T06:20:55Z"}},"pagination":{"pageSize":20},"sort":{"field":"orderDate","order":"asc"}}',
    responseBody: '{"nextPageUrl":"/v3/shipments/filter?next_token=ewogICJmaWx0ZXJUeXBlIiA6ICJwcmVEaXNwYXRjaCIsCiAgInNlbGxlcklkIiA6ICIzZmYzZTI4OTM2N2I0MjliIiwKICAidG9rZW4iIDogbnVsbCwKICAidmlldyIgOiAib3JkZXJfYXBpLnYzLnNoaXBtZW50IiwKICAidGVtcGxhdGUiIDogIm9hcGlfcHJlX2Rpc3BhdGNoIgp9","hasMore":false,"shipments":[]}',
    httpStatus: '200',
    channel: 'Flipkart',
    raw: {},
  },
  {
    id: '3',
    apiName: 'Pack Order',
    method: 'POST',
    url: 'https://api.flipkart.net/sellers/v3/shipments/pack',
    status: 'FAILURE',
    duration: 180,
    timestamp: '2025-04-26T06:20:56.200Z',
    requestBody: '{"shipmentId":"SHIP12345","action":"PACK"}',
    responseBody: '{"errorId": "099a41cc-fcb6-4035-8b57-c81088aed2cc","error": "{\"error\":\"invalid_token\",\"error_description\":\"Invalid access token: 338c0247-0945-41a8-a1fb-e71d79b0af51\"}"}',
    httpStatus: '500',
    channel: 'Flipkart',
    raw: {},
  },
  {
    id: '4',
    apiName: 'Update Inventory',
    method: 'PUT',
    url: 'https://api.flipkart.net/sellers/v3/inventory/update',
    status: 'SUCCESS',
    duration: 95,
    timestamp: '2025-04-26T06:20:56.350Z',
    requestBody: '{"sku":"SKU123","quantity":10}',
    responseBody: '{"status":"UPDATED","sku":"SKU123"}',
    httpStatus: '200',
    channel: 'Flipkart',
    raw: {},
  },
  {
    id: '5',
    apiName: 'Send Notification',
    method: 'POST',
    url: 'https://api.notification.service/send',
    status: 'SUCCESS',
    duration: 60,
    timestamp: '2025-04-26T06:20:56.500Z',
    requestBody: '{"orderId":"ORDER123","message":"Order packed and ready to ship."}',
    responseBody: '{"status":"SENT","orderId":"ORDER123"}',
    httpStatus: '200',
    channel: 'NotificationService',
    raw: {},
  },
];

// Helper to generate CSV for a single log
export function generateLogCSV(log: MockSystemLog): string {
  const headers = [
    'API Name', 'Method', 'URL', 'Status', 'Duration', 'Timestamp', 'Request Body', 'Response Body', 'HTTP Status', 'Channel'
  ];
  const values = [
    log.apiName,
    log.method,
    log.url,
    log.status,
    log.duration,
    log.timestamp,
    log.requestBody,
    log.responseBody,
    log.httpStatus,
    log.channel
  ];
  return `${headers.join(',')}
${values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')}`;
} 