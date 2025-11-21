'use client';

import { motion } from 'framer-motion';
import { Terminal, LogOut } from 'lucide-react';

export default function FloatingNav({ activeRoute, setActiveRoute, isAuthenticated, onLogout }) {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">
                {/* Logo */}
                <button
                    onClick={() => setActiveRoute('landing')}
                    className="flex items-center gap-2 text-white font-bold tracking-tight"
                >
                    <Terminal size={20} className="text-cyan-400" />
                    <span>BrowUser.ai</span>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
                    <button
                        onClick={() => setActiveRoute('landing')}
                        className="hover:text-white transition-colors"
                    >
                        Features
                    </button>
                    <button className="hover:text-white transition-colors">Pricing</button>
                    <button className="hover:text-white transition-colors">Docs</button>
                </div>

                {/* CTA */}
                {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveRoute('dashboard')}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium text-sm"
                        >
                            Dashboard
                        </motion.button>
                        <button
                            onClick={onLogout}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveRoute('login')}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium text-sm shadow-lg shadow-cyan-500/50"
                    >
                        Enter Portal
                    </motion.button>
                )}
            </div>
        </motion.nav>
    );
}
