/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'deep-black': '#050505',
                'dark-gray': '#0a0a0a',
                'darker-gray': '#18181b',
                'cyan-electric': '#06b6d4',
                'cyan-glow': '#22d3ee',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulse: {
                    '0%, 100%': { opacity: '0.3' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s infinite',
                'fade-up': 'fade-up 0.5s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                pulse: 'pulse 8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
