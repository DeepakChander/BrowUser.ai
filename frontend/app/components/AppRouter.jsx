'use client';

import React, { useEffect, useState } from 'react';
import ProductionLandingPage from './ProductionLandingPage';
import ChatInterface from './ChatInterface';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AppRouter() {
    const [view, setView] = useState('loading'); // 'loading', 'login', 'chat', 'error'

    useEffect(() => {
        // Check URL query parameters on mount
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const uid = params.get('uid');

        if (status === 'success') {
            // Store UID in localStorage for the demo session
            if (uid) localStorage.setItem('browuser_uid', uid);

            setView('chat');
            // Optional: Clean URL without reload
            window.history.replaceState({}, document.title, "/");
        } else if (status === 'error') {
            setView('error');
        } else {
            // Check if we have a stored session
            if (localStorage.getItem('browuser_uid')) {
                setView('chat');
            } else {
                setView('login');
            }
        }
    }, []);

    if (view === 'loading') {
        return null;
    }

    if (view === 'chat') {
        return <ChatInterface />;
    }

    if (view === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-sans p-4">
                <div className="w-full max-w-md p-8 bg-red-50 border border-red-100 rounded-2xl text-center space-y-6">
                    <div className="flex justify-center">
                        <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-900">Login Failed</h2>
                    <p className="text-red-700">
                        We encountered an issue authenticating with Google. Please try again.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // Default to Login/Landing Page
    return <ProductionLandingPage />;
}
