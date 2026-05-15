export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  module: string;
  status: 'success' | 'error' | 'pending';
  details?: string;
}

export interface ActivityResponse extends ActivityLog {}
