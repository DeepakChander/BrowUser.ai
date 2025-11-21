'use client';

import ChatInterface from './ChatInterface';

export default function DashboardView({ setActiveRoute }) {
    return (
        <div className="min-h-screen bg-black/90">
            <ChatInterface />
        </div>
    );
}
