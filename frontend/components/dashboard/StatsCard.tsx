'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';
import Card from '@/app/components/ui/Card';

export default function StatsCard() {
    const [stats, setStats] = useState({ completed: 0, timeSaved: 0, successRate: 0 });

    useEffect(() => {
        // Simulate count up animation
        const interval = setInterval(() => {
            setStats(prev => {
                if (prev.completed >= 7) clearInterval(interval);
                return {
                    completed: Math.min(prev.completed + 1, 7),
                    timeSaved: Math.min(prev.timeSaved + 0.1, 2.3),
                    successRate: Math.min(prev.successRate + 2, 94)
                };
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">Today's Stats</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                            <CheckCircle size={18} />
                        </div>
                        <span className="text-sm text-white/80">Tasks Completed</span>
                    </div>
                    <span className="font-mono font-bold text-lg text-white">{stats.completed}</span>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                            <Clock size={18} />
                        </div>
                        <span className="text-sm text-white/80">Time Saved</span>
                    </div>
                    <span className="font-mono font-bold text-lg text-white">{stats.timeSaved.toFixed(1)}h</span>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                            <TrendingUp size={18} />
                        </div>
                        <span className="text-sm text-white/80">Success Rate</span>
                    </div>
                    <span className="font-mono font-bold text-lg text-white">{stats.successRate}%</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/40">Daily Limit</span>
                    <span className="text-white/80">3 / 10 tasks</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-electric to-cyan-glow w-[30%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </div>

                <button className="w-full mt-4 py-2 text-xs font-bold text-cyan-electric hover:bg-cyan-electric/10 rounded-lg transition-colors flex items-center justify-center gap-1 border border-cyan-electric/20 hover:border-cyan-electric/50">
                    Upgrade to Pro <ArrowUpRight size={12} />
                </button>
            </div>
        </Card>
    );
}
