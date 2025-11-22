'use client';

import { motion } from 'framer-motion';
import { Eye, Zap, Shield } from 'lucide-react';
import Card from '@/app/components/ui/Card';

const features = [
    {
        icon: Eye,
        title: "Live Transparency",
        description: "Watch every click in real-time. No black boxes, no trust issues."
    },
    {
        icon: Zap,
        title: "Self-Correcting",
        description: "AI adapts when websites change. No maintenance required."
    },
    {
        icon: Shield,
        title: "Bank-Grade Security",
        description: "Encrypted credentials. Zero logging. Your data stays yours."
    }
];

export default function SolutionSection() {
    return (
        <section className="py-32 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-black"
                    >
                        Meet Your <span className="text-cyan-electric">Neural Browser Engine</span>
                    </motion.h2>
                </div>

                {/* Video Demo Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto mb-24 aspect-video rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-gray-200 flex items-center justify-center relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 font-mono">Demo Video Placeholder</span>
                    </div>

                    <div className="z-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform cursor-pointer text-cyan-electric">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-current border-b-[10px] border-b-transparent ml-1" />
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover className="h-full bg-white border border-gray-100 shadow-sm">
                                <item.icon className="w-12 h-12 text-cyan-electric mb-6" />
                                <h3 className="text-xl font-bold mb-3 text-black">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
