import { Transcript, LogEntry, DashboardMetrics, CustomerConfig } from '../types';

// Mock Data Generators to simulate the Voiceflow API responses described in the plan

const MOCK_TRANSCRIPTS: Transcript[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `trans_${Math.random().toString(36).substr(2, 9)}`,
  sessionID: `sess_${Math.random().toString(36).substr(2, 9)}`,
  projectID: 'proj_demo_123',
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
  updatedAt: new Date().toISOString(),
  turnCount: Math.floor(Math.random() * 20) + 1,
  status: Math.random() > 0.3 ? 'completed' : 'abandoned',
  device: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
}));

const MOCK_METRICS: DashboardMetrics = {
  totalSessions: 1245,
  totalMessages: 8430,
  avgDuration: '4m 12s',
  topIntents: [
    { name: 'check_balance', count: 450 },
    { name: 'transfer_funds', count: 320 },
    { name: 'contact_support', count: 210 },
    { name: 'fallback', count: 150 },
  ],
  sessionsOverTime: [
    { date: 'Mon', count: 120 },
    { date: 'Tue', count: 132 },
    { date: 'Wed', count: 101 },
    { date: 'Thu', count: 134 },
    { date: 'Fri', count: 90 },
    { date: 'Sat', count: 230 },
    { date: 'Sun', count: 210 },
  ],
};

// Simulate authenticating a token
export const validateToken = async (token: string): Promise<CustomerConfig> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token.length > 3) {
        resolve({
          name: "Acme Corp",
          projectID: "vf_proj_12345",
          environmentID: "production"
        });
      } else {
        reject(new Error("Invalid Token"));
      }
    }, 800);
  });
};

// Simulate fetching transcripts list (POST /v1/transcript/project/{id})
export const fetchTranscripts = async (projectID: string): Promise<Transcript[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRANSCRIPTS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 600);
  });
};

// Simulate fetching specific logs for export/view (GET /v1/transcript/{id})
export const fetchTranscriptLogs = async (transcriptID: string): Promise<LogEntry[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate fake conversation
      const logs: LogEntry[] = [];
      const turns = 5;
      for (let i = 0; i < turns; i++) {
        logs.push({
          id: `log_u_${i}`,
          type: 'action', // User
          payload: { type: 'text', payload: 'Hello, I need help.' },
          createdAt: new Date().toISOString(),
        });
        logs.push({
          id: `log_a_${i}`,
          type: 'trace', // Voiceflow Assistant
          payload: { type: 'text', payload: 'Sure, what can I help you with today?' },
          createdAt: new Date().toISOString(),
        });
      }
      resolve(logs);
    }, 500);
  });
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_METRICS), 400));
};

// Simulate Real-time SSE Stream
// This mimics the backend opening a connection to Voiceflow's Interact Stream and piping it to frontend
export const subscribeToLiveSession = (
  sessionID: string,
  onMessage: (msg: any) => void,
  onClose: () => void
) => {
  let active = true;

  const simulateTurn = (turnIndex: number) => {
    if (!active) return;

    // Simulate User Input
    onMessage({
      type: 'user_message',
      text: `User message simulation ${turnIndex}`,
      timestamp: new Date().toISOString(),
    });

    // Simulate Bot "Thinking"
    setTimeout(() => {
      if (!active) return;
      onMessage({
        type: 'bot_trace',
        payload: { type: 'text', message: `This is a live stream response from Voiceflow for turn ${turnIndex}.` },
        timestamp: new Date().toISOString(),
      });
    }, 1000);

    // Schedule next turn
    if (turnIndex < 10) {
      setTimeout(() => simulateTurn(turnIndex + 1), 4000);
    } else {
      onClose();
    }
  };

  // Start simulation
  setTimeout(() => simulateTurn(1), 1000);

  return () => {
    active = false;
  };
};

// Export Utility
export const generateCSV = (logs: LogEntry[], transcriptID: string) => {
  const headers = ['Timestamp', 'Speaker', 'Message'];
  const rows = logs.map(log => {
    const speaker = log.type === 'trace' ? 'Assistant' : 'User';
    let message = '';
    
    // Simplistic parsing of VF payloads
    if (log.type === 'action' && log.payload?.payload) message = log.payload.payload;
    if (log.type === 'trace' && log.payload?.payload) message = log.payload.payload;
    if (!message) message = JSON.stringify(log.payload);

    return [log.createdAt, speaker, `"${message.replace(/"/g, '""')}"`].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${transcriptID}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
