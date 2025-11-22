'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Eye, CheckCircle } from 'lucide-react';
import Card from '@/app/components/ui/Card';

const steps = [
    {
        id: 1,
        icon: MessageSquare,
        title: "TELL",
        description: "Type your command: 'Send email to John with Q4 report attached'",
        visual: "Input Field"
    },
    {
        id: 2,
        icon: Eye,
        title: "WATCH",
        description: "Live stream shows AI navigating, clicking, typing",
        visual: "Live Preview"
    },
    {
        id: 3,
        icon: CheckCircle,
        title: "DONE",
        description: "Task complete. You stayed in flow. Time saved.",
        visual: "Success"
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-white relative">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-20 text-center text-black"
                >
                    How It Works
                </motion.h2>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 hidden md:block -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <Card className="bg-white border border-gray-100 shadow-lg text-center relative group overflow-visible pt-12">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-cyan-electric flex items-center justify-center font-bold text-cyan-electric z-20 shadow-md">
                                        {step.id}
                                    </div>

                                    <div className="mb-6 flex justify-center">
                                        <div className="w-16 h-16 rounded-full bg-cyan-electric/5 flex items-center justify-center text-cyan-electric group-hover:scale-110 transition-transform duration-300">
                                            <step.icon size={32} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-black">{step.title}</h3>
                                    <p className="text-gray-600 mb-6">{step.description}</p>

                                    <div className="h-32 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-xs text-gray-400 font-mono">
                                        [{step.visual}]
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
