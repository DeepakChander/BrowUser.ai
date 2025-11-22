'use client';

import { motion } from 'framer-motion';
import { Mail, FileText, ShoppingCart, Calendar, Folder, Search } from 'lucide-react';
import Card from '@/app/components/ui/Card';
import { cn } from '@/lib/utils';

const useCases = [
    {
        icon: Mail,
        title: "Email Management",
        description: "Auto-reply, sort, and archive based on your rules",
        className: "md:col-span-2 md:row-span-2"
    },
    {
        icon: FileText,
        title: "Data Entry",
        description: "Fill forms, update spreadsheets, cross-platform sync",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        icon: ShoppingCart,
        title: "E-commerce",
        description: "Price tracking, cart automation, order placement",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        icon: Calendar,
        title: "Scheduling",
        description: "Find meeting times, send invites, sync across platforms",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        icon: Folder,
        title: "File Organization",
        description: "Download, rename, organize files across cloud services",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        icon: Search,
        title: "Research",
        description: "Extract data, compile reports, monitor changes",
        className: "md:col-span-1 md:row-span-1"
    }
];

export default function UseCases() {
    return (
        <section className="py-32 bg-gray-50 relative">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-20 text-center text-black"
                >
                    Built For Every Workflow
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
                    {useCases.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={cn("h-full", item.className)}
                        >
                            <Card hover className="h-full flex flex-col justify-between bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <div className="w-12 h-12 rounded-lg bg-cyan-electric/10 flex items-center justify-center text-cyan-electric mb-4">
                                        <item.icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-black">{item.title}</h3>
                                </div>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
