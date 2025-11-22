'use client';

import { useState } from 'react';
import { SendHorizontal, Mail, HardDrive, Calendar, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function CommandInput() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, addTask } = useStore();

    const handleSubmit = async () => {
        if (!input.trim() || !user?.id) return;

        setIsLoading(true);
        try {
            // Send to backend
            await axios.post('http://localhost:5000/api/chat/query', {
                userId: user.id,
                query: input
            });

            // Add to local state
            addTask({
                id: Date.now().toString(),
                description: input,
                status: 'queued',
                createdAt: new Date()
            });

            setInput('');
        } catch (error) {
            console.error('Failed to send command', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const quickActions = [
        { icon: Mail, label: "Check Gmail", prompt: "Check my Gmail for unread emails from the last 24 hours" },
        { icon: HardDrive, label: "Save to Drive", prompt: "Find the latest PDF in my downloads and save it to Google Drive" },
        { icon: Calendar, label: "Schedule Meeting", prompt: "Find a slot on my calendar for next Tuesday at 2pm" },
    ];

    return (
        <div className="relative z-30">
            {/* Input Container */}
            <div className="glass-strong rounded-2xl p-2 flex items-end gap-2 transition-all focus-within:ring-1 focus-within:ring-cyan-electric/50 focus-within:border-cyan-electric/50 bg-white/5 border-white/10">
                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell me what to automate..."
                        className="w-full bg-transparent text-white placeholder-white/30 p-4 min-h-[60px] max-h-[200px] resize-none focus:outline-none text-lg font-medium"
                        rows={1}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 mb-1 mr-1",
                        input.trim()
                            ? "bg-cyan-electric text-black hover:bg-cyan-glow hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <SendHorizontal size={24} />
                    )}
                </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 px-1 custom-scrollbar">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-electric uppercase tracking-wider mr-2 shrink-0">
                    <Sparkles size={12} />
                    Suggestions:
                </div>
                {quickActions.map((action, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(action.prompt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 hover:text-cyan-electric hover:border-cyan-electric/30 hover:bg-cyan-electric/5 transition-all whitespace-nowrap group"
                    >
                        <action.icon size={14} className="text-cyan-electric/70 group-hover:text-cyan-electric group-hover:scale-110 transition-transform" />
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
