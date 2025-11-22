'use client';

import Link from 'next/link';
import { Bell, Settings, LogOut, User, LayoutDashboard, History } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function DashboardNav() {
    const { user, logout } = useStore();

    return (
        <nav className="h-16 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left */}
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-electric to-cyan-glow flex items-center justify-center text-black font-bold text-lg">
                        B
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight hidden md:block text-white">
                        BrowUser.ai
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            "bg-white/10 text-white"
                        )}
                    >
                        <LayoutDashboard size={16} className="inline-block mr-2 mb-0.5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/history"
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <History size={16} className="inline-block mr-2 mb-0.5" />
                        History
                    </Link>
                    <Link
                        href="/profile"
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Settings size={16} className="inline-block mr-2 mb-0.5" />
                        Settings
                    </Link>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-electric rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                </button>

                <div className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-white/40">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-electric/20 to-cyan-glow/20 border border-cyan-electric/50 flex items-center justify-center text-cyan-electric font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        {user?.name?.[0] || 'U'}
                    </div>
                </div>
            </div>
        </nav>
    );
}
