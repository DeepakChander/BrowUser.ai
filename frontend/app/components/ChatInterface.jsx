'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Tv, LogOut } from 'lucide-react';

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        { role: 'agent', content: 'Hello! I am your BrowUser Agent. I can automate your Google tasks. Try asking me to "Draft an email" or "List my files".' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- 🔐 Secure Token Fetcher ---
    const fetchAccessToken = async () => {
        // In a real app, you'd get the userId from a secure session/context
        // For this demo, we'll assume a userId is available or stored in localStorage
        // NOTE: You might need to temporarily hardcode a userId for testing if you don't have session management yet
        const userId = 'YOUR_TEST_USER_ID'; // TODO: Replace with actual logic to get current user ID

        // If we don't have a user ID in this context, we might need to rely on the backend session
        // For this step, let's assume the backend handles session or we pass a placeholder
        // In a real implementation, the cookie would handle the session.

        // For the purpose of this specific prompt step, we will just call the chat endpoint
        // The chat endpoint itself will handle the token refresh internally on the backend
        return null;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Use the stored user ID
            const userId = localStorage.getItem('browuser_uid');

            const response = await fetch('/api/chat/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage.content,
                    userId: userId
                }),
            });

            const data = await response.json();

            const agentMessage = {
                role: 'agent',
                content: data.response || "I received your request but couldn't process it."
            };

            setMessages(prev => [...prev, agentMessage]);

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'agent', content: "Error: Could not connect to the agent." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        window.location.href = '/';
    };

    return (
        <div className="flex h-screen bg-gray-50 text-black font-sans overflow-hidden">

            {/* Left Sidebar (Navigation/History) */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-cyan-400">
                        <Terminal size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">BrowUser.ai</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
                    <div className="p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                        New Automation Session
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium w-full"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-600">Agent Online</span>
                    </div>
                </div>

                {/* Split View: Chat & Live Preview */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Chat Area (Center) */}
                    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-gray-50">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-black text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-gray-50">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask the agent to do something..."
                                    className="w-full p-4 pr-14 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Live Preview Area (Right) */}
                    <div className="w-[400px] bg-white border-l border-gray-200 p-6 hidden xl:flex flex-col">
                        <div className="flex items-center space-x-2 mb-4 text-gray-800 font-bold">
                            <Tv size={20} />
                            <span>Live Preview</span>
                        </div>

                        {/* Placeholder TV Box */}
                        <div className="flex-1 bg-black rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                            <div className="text-center space-y-3 p-6">
                                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-400 text-sm font-mono">Waiting for visual stream...</p>
                            </div>

                            {/* Overlay Scanline Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none animate-[scan_4s_linear_infinite]"></div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">System Status</div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Connection</span>
                                <span className="text-green-600 font-medium">Stable</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-gray-600">Latency</span>
                                <span className="text-gray-800 font-medium">24ms</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
