import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export default function Input({
    label,
    error,
    helperText,
    className,
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-white/80 mb-2">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-electric focus:border-transparent',
                    'transition-smooth',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-white/60">{helperText}</p>
            )}
        </div>
    );
}
