'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import ParticleField from '@/components/3d/ParticleField';

export default function LoginPage() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google';
    };

    return (
        <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white text-black">
            {/* Background */}
            <ParticleField />

            {/* Back Link */}
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors z-20"
            >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </Link>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md px-6 relative z-10"
            >
                <Card className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white font-bold text-2xl mb-4 shadow-lg shadow-black/20">
                            B
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-black">Welcome Back</h1>
                        <p className="text-gray-500 text-sm">Access Mission Control</p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-900 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-400">Or</span>
                            </div>
                        </div>

                        <Link href="/dashboard">
                            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black">
                                Continue as Guest (Limited Demo)
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400">
                        By continuing, you agree to our{' '}
                        <a href="#" className="underline hover:text-black">Terms</a>
                        {' '}and{' '}
                        <a href="#" className="underline hover:text-black">Privacy Policy</a>
                    </div>
                </Card>
            </motion.div>
        </main>
    );
}
