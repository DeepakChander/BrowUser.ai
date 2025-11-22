'use client';

import { useStore } from '@/store/useStore';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/app/components/ui/Card';

export default function TaskList() {
    const { recentTasks } = useStore();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} className="text-green-500" />;
            case 'failed': return <XCircle size={16} className="text-red-500" />;
            case 'in_progress': return <Loader2 size={16} className="text-cyan-electric animate-spin" />;
            default: return <Clock size={16} className="text-white/40" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'in_progress': return 'bg-cyan-electric/10 text-cyan-electric border-cyan-electric/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Recent Tasks</h3>
                <select className="bg-transparent text-xs text-white/40 border-none focus:ring-0 cursor-pointer hover:text-white">
                    <option className="bg-black">All Tasks</option>
                    <option className="bg-black">Completed</option>
                    <option className="bg-black">Failed</option>
                </select>
            </div>

            <div className="space-y-3">
                {recentTasks.length === 0 ? (
                    <div className="text-center py-8 text-white/20 text-sm italic border border-dashed border-white/10 rounded-xl">
                        No tasks yet. Start one above!
                    </div>
                ) : (
                    recentTasks.map((task) => (
                        <Card
                            key={task.id}
                            hover
                            className="p-4 flex items-center justify-between bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn("p-2 rounded-lg border", getStatusBadge(task.status))}>
                                    {getStatusIcon(task.status)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{task.description}</p>
                                    <p className="text-xs text-white/40">
                                        {new Date(task.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <button className="w-full mt-4 text-xs text-white/40 hover:text-cyan-electric transition-colors flex items-center justify-center gap-1">
                View Full History →
            </button>
        </div>
    );
}
