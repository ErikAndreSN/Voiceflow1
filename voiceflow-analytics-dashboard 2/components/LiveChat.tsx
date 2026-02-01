import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, User, Bot, Wifi } from 'lucide-react';
import { ChatMessage } from '../types';
import { subscribeToLiveSession } from '../services/voiceflowService';

const LiveChat: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startMonitoring = () => {
    const sessionID = `live_${Math.random().toString(36).substr(2, 6)}`;
    setActiveSession(sessionID);
    setMessages([]);
    setIsListening(true);
    
    // Simulate initial launch
    setMessages([{ 
      id: 'init', 
      sender: 'system', 
      text: `Connected to session ${sessionID}. Waiting for user input...`, 
      timestamp: new Date().toISOString() 
    }]);

    unsubscribeRef.current = subscribeToLiveSession(
      sessionID,
      (event) => {
        if (event.type === 'user_message') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'user',
            text: event.text,
            timestamp: event.timestamp
          }]);
        } else if (event.type === 'bot_trace') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'assistant',
            text: event.payload.message || JSON.stringify(event.payload),
            timestamp: event.timestamp
          }]);
        }
      },
      () => {
        setMessages(prev => [...prev, { 
          id: 'end', 
          sender: 'system', 
          text: 'Session ended.', 
          timestamp: new Date().toISOString() 
        }]);
        setIsListening(false);
      }
    );
  };

  const stopMonitoring = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    setIsListening(false);
    setActiveSession(null);
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Live Monitor
            {isListening && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </h2>
          <p className="text-slate-500">Monitor active conversations in real-time via SSE.</p>
        </div>
        
        {!isListening ? (
          <button 
            onClick={startMonitoring}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-200"
          >
            <Play size={18} /> Start Monitoring
          </button>
        ) : (
          <button 
            onClick={stopMonitoring}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-lg font-medium transition-all border border-red-200"
          >
            <Square size={18} /> Stop Session
          </button>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative">
        {!activeSession && !messages.length && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <Wifi size={48} className="mb-4 opacity-50" />
            <p>Ready to connect to Interact Stream</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <span className="text-xs font-mono text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">{msg.text}</span>
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-2 block opacity-70 ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
