export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  traceId: string;
  timestampUtc: string;
  details?: string | null;
}
