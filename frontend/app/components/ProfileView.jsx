'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Key, BarChart3, Settings } from 'lucide-react';

export default function ProfileView({ setActiveRoute }) {
    const [user, setUser] = useState(null);
    const [complianceInfo, setComplianceInfo] = useState(null);

    useEffect(() => {
        // Load user data from localStorage
        const userId = localStorage.getItem('browuser_uid');
        const userEmail = localStorage.getItem('browuser_email');
        setUser({ id: userId, email: userEmail });

        // Load compliance info
        fetch('http://localhost:5000/api/compliance/status')
            .then(res => res.json())
            .then(data => setComplianceInfo(data))
            .catch(err => console.error("Failed to load compliance info", err));
    }, []);

    return (
        <div className="min-h-screen px-6 py-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl font-black text-white mb-2">Profile</h1>
                    <p className="text-white/60">Manage your account and preferences</p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Identity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.email || 'Loading...'}</h2>
                                <p className="text-white/60 text-sm">ID: {user?.id?.slice(0, 8) || '...'}</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                            Edit Profile
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                        <BarChart3 className="w-8 h-8 text-cyan-400 mb-4" />
                        <h3 className="text-white font-bold mb-2">Activity</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-white/60 text-sm">Tasks Automated</p>
                                <p className="text-2xl font-bold text-white">14</p>
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Time Saved</p>
                                <p className="text-2xl font-bold text-white">2h 30m</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Connected Tools */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-cyan-400" />
                            Connected Tools
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {complianceInfo?.connected_tools?.map((tool, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30"
                                >
                                    {tool}
                                </span>
                            )) || <p className="text-white/60">Loading...</p>}
                        </div>
                    </motion.div>

                    {/* API Keys */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8"
                    >
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-cyan-400" />
                            API Access
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-white/60 text-xs mb-1">API Key</p>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value="sk-••••••••••••••••"
                                        readOnly
                                        className="flex-1 bg-black/30 text-white px-3 py-2 rounded-lg text-sm"
                                    />
                                    <button className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                                Regenerate Key
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => setActiveRoute('dashboard')}
                    className="mt-8 text-white/60 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
}
