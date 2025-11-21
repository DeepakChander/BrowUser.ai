'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Cpu } from 'lucide-react';

export default function LandingView({ setActiveRoute }) {
    const tools = ['Gmail', 'Google Drive', 'GitHub', 'Slack', 'Notion', 'Trello'];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-5xl"
            >
                <motion.h1
                    className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-6"
                    whileHover={{
                        textShadow: "0 0 20px #00ffff, 0 0 40px #00ffff",
                        color: "#00ffff"
                    }}
                >
                    AUTOMATION.
                    <br />
                    ELEVATED.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto"
                >
                    Your AI-powered agent that automates complex workflows across your favorite tools.
                    No code. No limits.
                </motion.p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveRoute('login')}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-bold text-lg shadow-2xl shadow-cyan-500/50 relative overflow-hidden group"
                >
                    <span className="relative z-10">Start Automating</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl"
            >
                {[
                    { icon: Zap, title: 'Lightning Fast', desc: 'Execute complex workflows in seconds' },
                    { icon: Shield, title: 'Secure by Design', desc: 'Your data never leaves your control' },
                    { icon: Cpu, title: 'AI-Powered', desc: 'Natural language to automation' }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                    >
                        <feature.icon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-white/60">{feature.desc}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tool Marquee */}
            <div className="mt-24 w-full overflow-hidden">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="flex gap-8 text-white/40 text-2xl font-bold whitespace-nowrap"
                >
                    {[...tools, ...tools, ...tools].map((tool, idx) => (
                        <span key={idx} className="hover:text-cyan-400 transition-colors cursor-pointer">
                            {tool}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
