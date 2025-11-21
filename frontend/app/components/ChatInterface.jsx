'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Terminal, Tv, LogOut, Activity, Wifi, WifiOff, Save, RefreshCw, Play, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        { role: 'agent', content: 'Hello! I am your BrowUser Agent (Python Powered). I can automate your Google tasks. Try asking me to "Draft an email" or "List my files".' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [liveImage, setLiveImage] = useState(null);
    const [statusText, setStatusText] = useState('Standby');
    const [wsStatus, setWsStatus] = useState('disconnected');
    const [showSaveOption, setShowSaveOption] = useState(false);
    const [savedAutomations, setSavedAutomations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const retryCount = useRef(0);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch Saved Automations & Suggestions
    useEffect(() => {
        const userId = localStorage.getItem('browuser_uid');
        if (userId) {
            // Load Saved
            fetch(`http://localhost:5000/api/automation/list/${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.automations) {
                        setSavedAutomations(data.automations);
                    }
                })
                .catch(err => console.error("Failed to load automations", err));

            // Load Suggestions
            fetch(`http://localhost:5000/api/automation/analyze/${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.suggestions) {
                        setSuggestions(data.suggestions);
                    }
                })
                .catch(err => console.error("Failed to load suggestions", err));
        }
    }, []);

    // --- 🔌 WebSocket Connection Logic ---
    const connectWebSocket = useCallback(() => {
        const userId = localStorage.getItem('browuser_uid');
        if (!userId) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        console.log('Attempting to connect to Live Stream...');
        const ws = new WebSocket(`ws://localhost:5000/ws/live-preview/${userId}`);

        ws.onopen = () => {
            console.log('✅ Connected to Live Preview Stream');
            setWsStatus('connected');
            retryCount.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                if (payload.type === 'image') {
                    setLiveImage(`data:image/jpeg;base64,${payload.data}`);
                } else if (payload.type === 'status') {
                    setStatusText(payload.data);
                } else if (payload.type === 'log') {
                    setLogs(prev => [payload.data, ...prev].slice(0, 50)); // Keep last 50 logs
                }
            } catch (e) {
                if (event.data.startsWith('data:image') || event.data.length > 100) {
                    setLiveImage(`data:image/jpeg;base64,${event.data}`);
                }
            }
        };

        ws.onclose = () => {
            console.log('❌ Disconnected from Live Preview Stream');
            setWsStatus('disconnected');
            wsRef.current = null;

            // Retry logic
            if (retryCount.current < 5) {
                const timeout = Math.min(1000 * (2 ** retryCount.current), 10000);
                retryCount.current += 1;
                setTimeout(connectWebSocket, timeout);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setWsStatus('error');
        };

        wsRef.current = ws;
    }, []);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWebSocket]);

    const ensureSessionExists = () => {
        const userId = localStorage.getItem('browuser_uid');
        if (!userId) {
            console.warn("No session found, redirecting...");
            window.location.href = '/';
            return false;
        }
        return true;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (!ensureSessionExists()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setLiveImage(null);
        setStatusText('Agent is decomposing task...'); // UX Polish: Initial status
        setShowSaveOption(false);

        try {
            const userId = localStorage.getItem('browuser_uid');

            const response = await fetch('http://localhost:5000/api/chat/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage.content,
                    userId: userId
                }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 500) {
                    throw new Error("Session expired or User not found");
                }
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const agentResponseContent = data.response?.message || "Processing complete.";

            const agentMessage = {
                role: 'agent',
                content: agentResponseContent
            };

            setMessages(prev => [...prev, agentMessage]);
            setStatusText('Completed');
            setShowSaveOption(true);

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'agent', content: "Error: Session invalid or Agent unreachable. Please Sign Out and Login again." }]);
            setStatusText('Error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAutomation = async () => {
        const name = prompt("Enter a name for this automation:");
        if (!name) return;

        const userId = localStorage.getItem('browuser_uid');
        try {
            await fetch('http://localhost:5000/api/automation/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    name: name,
                    description: "Saved from chat session"
                })
            });
            alert("Automation Saved!");
            setShowSaveOption(false);
            // Refresh list
            const res = await fetch(`http://localhost:5000/api/automation/list/${userId}`);
            const data = await res.json();
            if (data.automations) setSavedAutomations(data.automations);

        } catch (e) {
            alert("Failed to save.");
        }
    };

    const handleRunAutomation = (name) => {
        setInput(`Run automation: ${name}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('browuser_uid');
        window.location.href = '/';
    };

    const manualReconnect = () => {
        if (wsRef.current) wsRef.current.close();
        connectWebSocket();
    };

    return (
        <div className="flex h-screen bg-gray-50 text-black font-sans overflow-hidden">

            {/* Left Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-cyan-400">
                        <Terminal size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">BrowUser.ai</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Suggestions Section */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Sparkles size={12} /> AI Suggestions
                            </div>
                            {suggestions.map((sug, idx) => (
                                <div key={idx} onClick={() => setInput(`Create automation: ${sug.suggestion_title}`)} className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 cursor-pointer hover:bg-cyan-100 transition-colors group">
                                    <div className="text-sm font-bold text-cyan-900">{sug.suggestion_title}</div>
                                    <div className="text-xs text-cyan-600 mt-1">Saves ~{sug.estimated_time_saved}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Saved Automations Section */}
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <BookOpen size={12} /> Saved Automations
                        </div>
                        {savedAutomations.length === 0 && (
                            <div className="text-xs text-gray-400 italic p-2">No saved workflows yet.</div>
                        )}
                        {savedAutomations.map((auto, idx) => (
                            <div key={idx} onClick={() => handleRunAutomation(auto.name)} className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-cyan-50 hover:text-cyan-700 transition-colors border border-transparent hover:border-cyan-100 flex items-center justify-between group">
                                <span>{auto.name}</span>
                                <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agent Logs Toggle */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-black transition-colors font-medium"
                    >
                        <span className="flex items-center gap-2"><Terminal size={14} /> Agent Logs</span>
                        <span>{showLogs ? '▼' : '▲'}</span>
                    </button>

                    {showLogs && (
                        <div className="mt-2 h-48 bg-black rounded-lg p-3 overflow-y-auto font-mono text-[10px] text-green-400 shadow-inner">
                            {logs.length === 0 && <div className="text-gray-600 italic">Waiting for logs...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="mb-2 border-b border-gray-800 pb-1 last:border-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold ${log.action_type === 'ERROR' ? 'text-red-500' :
                                                log.action_type === 'LLM_THINK' ? 'text-blue-400' :
                                                    log.action_type === 'TOOL_EXEC' ? 'text-yellow-400' : 'text-gray-400'
                                            }`}>[{log.action_type}]</span>
                                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-gray-300 break-words whitespace-pre-wrap">
                                        {JSON.stringify(log.details, null, 2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium w-full px-2 py-2 rounded-lg hover:bg-red-50">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 tracking-wide">AGENT ONLINE (AUTONOMOUS)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {showSaveOption && (
                            <button onClick={handleSaveAutomation} className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold hover:bg-cyan-100 transition-colors animate-pulse">
                                <Save size={14} />
                                <span>Save Workflow</span>
                            </button>
                        )}
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-500">
                            v5.0.0-auditing
                        </div>
                    </div>
                </div>

                {/* Split View */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-gray-50/50">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                        }`}>
                                        <div className="markdown-body">
                                            {msg.content}
                                        </div>
                                        {msg.role === 'agent' && msg.content.includes("Task Completed") && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
                                                    <BookOpen size={12} /> View Audit Trail
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-in fade-in duration-300">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center space-x-2">
                                        <Activity size={16} className="text-cyan-500 animate-spin" />
                                        <span className="text-xs text-gray-500 font-medium">{statusText}</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white border-t border-gray-200">
                            <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask the agent to do something..."
                                    className="w-full p-4 pr-14 bg-gray-50 border border-gray-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-2 p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Live Preview Area */}
                    <div className="w-[450px] bg-white border-l border-gray-200 p-6 hidden xl:flex flex-col shadow-xl z-20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2 text-gray-900 font-bold text-lg">
                                <Tv size={22} />
                                <span>Live Automation Preview</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={manualReconnect} className="text-gray-400 hover:text-black transition-colors" title="Reconnect Signal">
                                    <RefreshCw size={14} />
                                </button>
                                <div className={`flex items-center space-x-2 text-xs font-bold uppercase ${wsStatus === 'connected' ? 'text-green-500' :
                                    wsStatus === 'error' ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {wsStatus === 'connected' ? <Wifi size={14} /> : <WifiOff size={14} />}
                                    <span>{wsStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* TV Box */}
                        <div className="flex-1 bg-gray-900 rounded-2xl relative overflow-hidden shadow-2xl flex items-center justify-center group border-4 border-gray-800">
                            {liveImage ? (
                                <img
                                    src={liveImage}
                                    alt="Live Stream"
                                    className="w-full h-full object-contain animate-in fade-in duration-200"
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/5"></div>
                                    <div className="text-center space-y-4 p-8 relative z-10">
                                        {wsStatus === 'error' ? (
                                            <div className="text-red-400 flex flex-col items-center">
                                                <AlertTriangle size={48} className="mb-2" />
                                                <p className="font-bold">CONNECTION LOST</p>
                                                <p className="text-xs mt-1">Check server logs</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative mx-auto w-20 h-20">
                                                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                                                    <div className="relative w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                                <div>
                                                    <p className="text-cyan-400 text-sm font-mono font-bold tracking-wider">AWAITING SIGNAL</p>
                                                    <p className="text-gray-500 text-xs mt-1">Visual stream inactive</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none animate-[scan_3s_linear_infinite]"></div>
                        </div>

                        {/* System Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                                <div className={`text-sm font-bold flex items-center gap-1 ${statusText === 'Error' ? 'text-red-500' : 'text-gray-800'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${liveImage ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    {statusText}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Latency</div>
                                <div className="text-sm font-bold text-gray-800">{liveImage ? '24ms' : '-- ms'}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
