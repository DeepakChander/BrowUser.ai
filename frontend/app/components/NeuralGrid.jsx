'use client';

import { useEffect, useState } from 'react';

// CSS Fallback Background (no WebGL required)
function CSSFallbackBackground({ blur, intensity }) {
    return (
        <div className={`fixed inset-0 -z-10 bg-black ${blur ? 'blur-md' : ''}`}>
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0, 255, 255, ${0.1 * intensity}) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 100, 255, ${0.15 * intensity}) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(0, 255, 255, ${0.08 * intensity}) 0%, transparent 50%)
          `,
                    animation: 'pulse 8s ease-in-out infinite'
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    opacity: intensity
                }}
            />
            <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

// Main component with WebGL detection
export default function NeuralGrid({ blur = false, intensity = 1.0 }) {
    const [useCSS, setUseCSS] = useState(false);

    useEffect(() => {
        // Check if WebGL is supported
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                console.warn('WebGL not supported, using CSS fallback');
                setUseCSS(true);
            }
        } catch (e) {
            console.warn('WebGL detection failed, using CSS fallback');
            setUseCSS(true);
        }
    }, []);

    // Always use CSS fallback to avoid WebGL errors
    return <CSSFallbackBackground blur={blur} intensity={intensity} />;
}
