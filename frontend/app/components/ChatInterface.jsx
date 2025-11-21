'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Tv, LogOut, Activity } from 'lucide-react';

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        { role: 'agent', content: 'Hello! I am your BrowUser Agent (Python Powered). I can automate your Google tasks. Try asking me to "Draft an email" or "List my files".' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [liveImage, setLiveImage] = useState(null); // State for live preview image
    const messagesEndRef = useRef(null);
    const wsRef = useRef(null); // WebSocket reference

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- 🔌 WebSocket Connection ---
    useEffect(() => {
        const userId = localStorage.getItem('browuser_uid');
        if (!userId) return;

        // Connect to WebSocket
        const ws = new WebSocket(`ws://localhost:5000/ws/live-preview/${userId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to Live Preview Stream');
        };

        ws.onmessage = (event) => {
            // Receive Base64 image string
            const imageSrc = event.data;
            setLiveImage(imageSrc);
        };

        ws.onclose = () => {
            console.log('Disconnected from Live Preview Stream');
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setLiveImage(null); // Reset preview on new task

        try {
            const userId = localStorage.getItem('browuser_uid');

            if (!userId) {
                window.location.href = '/';
                return;
            }

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

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'agent', content: "Error: Session invalid or Agent unreachable. Please Sign Out and Login again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('browuser_uid');
        window.location.href = '/';
    };

    return (
        <div className="flex h-screen bg-gray-50 text-black font-sans overflow-hidden">

            {/* Left Sidebar (Navigation/History) */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-cyan-400">
                        <Terminal size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">BrowUser.ai</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300">
                        New Automation Session
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium w-full px-2 py-2 rounded-lg hover:bg-red-50"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 tracking-wide">AGENT ONLINE (PYTHON + LIVE STREAM)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-mono text-gray-500">
                            v2.1.0-live
                        </div>
                    </div>
                </div>

                {/* Split View: Chat & Live Preview */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Chat Area (Center) */}
                    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-gray-50/50">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start animate-in fade-in duration-300">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center space-x-2">
                                        <Activity size={16} className="text-cyan-500 animate-spin" />
                                        <span className="text-xs text-gray-500 font-medium">Processing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
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

                    {/* Live Preview Area (Right) */}
                    <div className="w-[450px] bg-white border-l border-gray-200 p-6 hidden xl:flex flex-col shadow-xl z-20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2 text-gray-900 font-bold text-lg">
                                <Tv size={22} />
                                <span>Live Automation Preview</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${liveImage ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        </div>

                        {/* TV Box */}
                        <div className="flex-1 bg-gray-900 rounded-2xl relative overflow-hidden shadow-2xl flex items-center justify-center group border-4 border-gray-800">

                            {liveImage ? (
                                // LIVE STREAM IMAGE
                                <img
                                    src={liveImage}
                                    alt="Live Stream"
                                    className="w-full h-full object-contain animate-in fade-in duration-200"
                                />
                            ) : (
                                // PLACEHOLDER
                                <>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/5"></div>

                                    <div className="text-center space-y-4 p-8 relative z-10">
                                        <div className="relative mx-auto w-20 h-20">
                                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                                            <div className="relative w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <div>
                                            <p className="text-cyan-400 text-sm font-mono font-bold tracking-wider">AWAITING SIGNAL</p>
                                            <p className="text-gray-500 text-xs mt-1">Visual stream inactive</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Overlay Scanline Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none animate-[scan_3s_linear_infinite]"></div>
                        </div>

                        {/* System Stats */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                                <div className={`text-sm font-bold flex items-center gap-1 ${liveImage ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${liveImage ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    {liveImage ? 'Streaming' : 'Standby'}
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
