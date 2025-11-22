'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import HeroScene from '@/components/3d/HeroScene';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white">
            {/* 3D Background */}
            <HeroScene />

            {/* Content */}
            <div className="container mx-auto px-6 text-center relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6 text-black"
                >
                    The Only AI That Works
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-electric to-cyan-600">
                        Across All Your Tabs
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-light"
                >
                    Watch AI automate your browser in real-time. No APIs needed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                >
                    <Link href="/login">
                        <Button variant="primary" size="lg" className="rounded-full px-10 text-lg shadow-lg shadow-cyan-electric/20 hover:shadow-cyan-electric/40">
                            Get Started Free
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="rounded-full px-10 text-lg border-gray-200 text-gray-700 hover:bg-gray-50">
                        Watch Demo
                    </Button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 text-sm flex flex-col items-center gap-2"
            >
                <span>Discover more</span>
                <div className="w-px h-8 bg-gradient-to-b from-cyan-electric to-transparent" />
            </motion.div>
        </section>
    );
}
