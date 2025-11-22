'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Globe, Key, CheckCircle, XCircle, Terminal, Bot, User } from 'lucide-react';
import { useWebSocket } from '@/lib/websocket';
import { cn } from '@/lib/utils';

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'plan' | 'nav' | 'auth' | 'success' | 'error' | 'info' | 'user';
    message: string;
}

export default function ThoughtLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { socket } = useWebSocket();

    useEffect(() => {
        // Add initial greeting
        setLogs([{
            id: 'init',
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
            type: 'info',
            message: 'BrowUser Agent initialized. Ready for commands.'
        }]);

        socket.on('log', (data: any) => {
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                type: mapLogType(data.type || 'info'),
                message: typeof data === 'string' ? data : data.message || JSON.stringify(data)
            };
            setLogs(prev => [...prev, newLog]);
        });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const mapLogType = (type: string): LogEntry['type'] => {
        if (type.includes('plan')) return 'plan';
        if (type.includes('nav')) return 'nav';
        if (type.includes('auth')) return 'auth';
        if (type.includes('success')) return 'success';
        if (type.includes('error')) return 'error';
        return 'info';
    };

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'plan': return <Brain size={14} className="text-cyan-electric" />;
            case 'nav': return <Globe size={14} className="text-blue-400" />;
            case 'auth': return <Key size={14} className="text-yellow-400" />;
            case 'success': return <CheckCircle size={14} className="text-green-500" />;
            case 'error': return <XCircle size={14} className="text-red-500" />;
            case 'user': return <User size={14} className="text-white" />;
            default: return <Terminal size={14} className="text-gray-500" />;
        }
    };

    return (
        <div className="flex-1 bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[300px] font-mono shadow-2xl">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-electric" />
                    <h3 className="text-xs font-bold text-cyan-electric tracking-wider uppercase">AI Reasoning Log</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-white/40">Online</span>
                </div>
            </div>

            {/* Log Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                                "flex gap-3 items-start group text-sm",
                                log.type === 'error' ? "text-red-400" :
                                    log.type === 'success' ? "text-green-400" :
                                        log.type === 'plan' ? "text-cyan-electric" :
                                            "text-white/70"
                            )}
                        >
                            <span className="text-white/20 text-xs shrink-0 mt-0.5 select-none">[{log.timestamp}]</span>
                            <div className="shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">{getIcon(log.type)}</div>
                            <p className="break-all leading-relaxed group-hover:text-white transition-colors">
                                {log.message}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
