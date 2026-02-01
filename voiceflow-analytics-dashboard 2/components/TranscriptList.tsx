import React, { useEffect, useState } from 'react';
import { Download, Search, FileText, ChevronRight, Eye } from 'lucide-react';
import { Transcript, LogEntry } from '../types';
import { fetchTranscripts, fetchTranscriptLogs, generateCSV } from '../services/voiceflowService';

const TranscriptList: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewingLogs, setViewingLogs] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTranscripts('proj_123');
      setTranscripts(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleView = async (transcript: Transcript) => {
    setSelectedTranscript(transcript);
    setViewingLogs(true);
    const data = await fetchTranscriptLogs(transcript.id);
    setLogs(data);
  };

  const handleExport = async (transcript: Transcript) => {
    // In a real app, this might just trigger a backend URL download
    // Here we fetch and generate client side
    const data = await fetchTranscriptLogs(transcript.id);
    generateCSV(data, transcript.id);
  };

  if (viewingLogs && selectedTranscript) {
    return (
      <div className="p-8 h-screen flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button 
              onClick={() => setViewingLogs(false)}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-2 flex items-center"
            >
              ← Back to list
            </button>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Transcript <span className="text-slate-400 text-lg font-normal">#{selectedTranscript.sessionID}</span>
            </h2>
          </div>
          <button
            onClick={() => handleExport(selectedTranscript)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 p-4 font-medium text-slate-500 grid grid-cols-12 gap-4">
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Speaker</div>
            <div className="col-span-8">Message / Payload</div>
          </div>
          <div className="overflow-y-auto p-4 space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 py-3 border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50/50 rounded px-2">
                <div className="col-span-2 text-slate-400 font-mono text-xs">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    log.type === 'trace' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {log.type === 'trace' ? 'Assistant' : 'User'}
                  </span>
                </div>
                <div className="col-span-8 font-mono text-slate-700 break-words">
                  {log.type === 'trace' ? (
                     <span>{log.payload?.payload?.message || log.payload?.payload || JSON.stringify(log.payload)}</span>
                  ) : (
                     <span>{log.payload?.payload || JSON.stringify(log.payload)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transcript History</h2>
          <p className="text-slate-500">Search and export past conversations.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Session ID..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Session ID</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Turns</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading transcripts...</td></tr>
            ) : transcripts.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.sessionID}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{t.turnCount}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleView(t)}
                      className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded transition-colors"
                      title="View Logs"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleExport(t)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Export CSV"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TranscriptList;
