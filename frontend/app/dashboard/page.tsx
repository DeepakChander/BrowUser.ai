'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import CommandInput from '@/components/dashboard/CommandInput';
import ThoughtLog from '@/components/dashboard/ThoughtLog';
import LivePreview from '@/components/dashboard/LivePreview';
import StatsCard from '@/components/dashboard/StatsCard';
import TaskList from '@/components/dashboard/TaskList';
import WireframeGrid from '@/components/3d/WireframeGrid';
import { useStore } from '@/store/useStore';

export default function DashboardPage() {
    const { user } = useStore();
    const router = useRouter();

    // Protected Route Check
    useEffect(() => {
        const uid = localStorage.getItem('browuser_uid');
        // In a real app, verify token validity
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-electric/30 dark-theme overflow-hidden">
            {/* 3D Background */}
            <WireframeGrid />

            <DashboardNav />

            <div className="container mx-auto px-6 py-8 h-[calc(100vh-64px)] relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                    {/* Left Panel (Chat Interface) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                        <ThoughtLog />
                        <CommandInput />
                    </div>

                    {/* Right Panel (Live Preview & Stats) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pb-6 custom-scrollbar">
                        <LivePreview />
                        <StatsCard />
                        <TaskList />
                    </div>

                </div>
            </div>
        </main>
    );
}
