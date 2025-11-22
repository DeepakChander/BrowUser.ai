'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { cn } from '@/lib/utils';

const plans = [
    {
        name: "FREE",
        price: "$0",
        features: ["10 tasks/month", "Live streaming", "Community support", "Basic automation"],
        cta: "Start Free",
        variant: "outline" as const,
        popular: false
    },
    {
        name: "PRO",
        price: "$29",
        period: "/month",
        features: ["Unlimited tasks", "Priority processing", "Dedicated support", "Advanced automation", "Custom workflows"],
        cta: "Start Pro Trial",
        variant: "primary" as const,
        popular: true
    },
    {
        name: "ENTERPRISE",
        price: "Custom",
        features: ["Everything in Pro", "On-premise deployment", "SLA guarantee", "Custom integrations", "Dedicated account manager"],
        cta: "Contact Sales",
        variant: "outline" as const,
        popular: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-32 bg-gray-50 relative">
            <div className="container mx-auto px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-20 text-center text-black"
                >
                    Simple, Transparent Pricing
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-electric text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg shadow-cyan-electric/30">
                                    MOST POPULAR
                                </div>
                            )}

                            <Card className={cn(
                                "h-full flex flex-col relative bg-white transition-all duration-300",
                                plan.popular ? "border-cyan-electric shadow-xl shadow-cyan-electric/10 scale-105 z-10" : "border-gray-200 shadow-sm hover:shadow-md"
                            )}>
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-2 text-gray-500">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-black">{plan.price}</span>
                                        {plan.period && <span className="text-gray-400">{plan.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                            <Check size={16} className="text-cyan-electric mt-0.5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button variant={plan.variant} className="w-full">
                                    {plan.cta}
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
