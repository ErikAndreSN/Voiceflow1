export interface CustomerConfig {
  name: string;
  projectID: string;
  environmentID: string;
}

export interface Transcript {
  id: string;
  sessionID: string;
  projectID: string;
  createdAt: string;
  updatedAt: string;
  browser?: string;
  device?: string;
  os?: string;
  turnCount: number;
  status: 'completed' | 'active' | 'abandoned';
}

export type LogType = 'trace' | 'action' | 'end';

export interface LogEntry {
  type: LogType;
  payload: any;
  createdAt: string;
  id: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  data?: any;
}

export interface DashboardMetrics {
  totalSessions: number;
  totalMessages: number;
  avgDuration: string;
  topIntents: { name: string; count: number }[];
  sessionsOverTime: { date: string; count: number }[];
}
