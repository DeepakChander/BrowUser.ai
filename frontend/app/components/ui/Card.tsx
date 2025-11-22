import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className, hover = false, onClick }: CardProps) {
    const Component = onClick ? motion.div : 'div';

    return (
        <Component
            className={cn(
                'glass rounded-2xl p-6',
                hover && 'cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-electric/20',
                'transition-smooth',
                className
            )}
            onClick={onClick}
            {...(onClick && {
                whileHover: { y: -8 },
                whileTap: { scale: 0.98 },
            })}
        >
            {children}
        </Component>
    );
}
