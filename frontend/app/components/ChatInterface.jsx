'use client';

import React from 'react';
import { LogOut, Terminal } from 'lucide-react';

export default function ChatInterface() {
    const handleLogout = () => {
        // Simple redirect to clear query params for now
        window.location.href = '/';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-black font-sans">
            <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl border border-gray-200 text-center space-y-6">

                <div className="flex justify-center">
                    <div className="p-4 bg-cyan-50 rounded-full text-cyan-600">
                        <Terminal size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome! Authentication Successful.
                </h1>

                <p className="text-lg text-gray-600">
                    Ready to automate tasks. Your neural agent is online.
                </p>

                <div className="pt-4">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
                    >
                        <LogOut className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                        Log Out
                    </button>
                </div>

            </div>
        </div>
    );
}
