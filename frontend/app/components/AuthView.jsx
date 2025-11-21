'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';

export default function AuthView({ setActiveRoute, onGoogleLogin }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'

    const handleGoogleAuth = () => {
        // Redirect to existing Google OAuth endpoint
        window.location.href = 'http://localhost:5000/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* Glass Card */}
                <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'login'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'signup'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-black text-white mb-2">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white/60 mb-8">
                                {mode === 'login'
                                    ? 'Sign in to access your automations'
                                    : 'Join thousands of power users'}
                            </p>

                            {/* Google OAuth Button (Primary) */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGoogleAuth}
                                className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold mb-6 flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </motion.button>

                            <div className="text-center text-white/40 text-sm">
                                {mode === 'login' ? (
                                    <p>
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => setMode('signup')}
                                            className="text-cyan-400 hover:underline"
                                        >
                                            Sign up
                                        </button>
                                    </p>
                                ) : (
                                    <p>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setMode('login')}
                                            className="text-cyan-400 hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => setActiveRoute('landing')}
                    className="mt-6 text-white/60 hover:text-white transition-colors mx-auto block"
                >
                    ← Back to Home
                </button>
            </motion.div>
        </div>
    );
}
