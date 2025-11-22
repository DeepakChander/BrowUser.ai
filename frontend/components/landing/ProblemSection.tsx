'use client';

import { motion } from 'framer-motion';
import { Settings, Clock, MessageSquare } from 'lucide-react';
import Card from '@/app/components/ui/Card';

const problems = [
    {
        icon: Settings,
        title: "OAuth Hell",
        description: "Setting up API integrations takes days and breaks constantly. We bypass the API and use the browser directly."
    },
    {
        icon: Clock,
        title: "Time Vampire",
        description: "Repetitive browser tasks steal hours from your productive work. Reclaim your time for high-leverage activities."
    },
    {
        icon: MessageSquare,
        title: "Chatbots Just Talk",
        description: "AI assistants tell you what to do. They don't actually DO it. BrowUser.ai executes actions for you."
    }
];

export default function ProblemSection() {
    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-20 text-center text-black"
                >
                    APIs Are Broken.
                    <br />
                    <span className="text-gray-400">Manual Work Is Exhausting.</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-electric/10 flex items-center justify-center mb-6 text-cyan-electric">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-black">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
