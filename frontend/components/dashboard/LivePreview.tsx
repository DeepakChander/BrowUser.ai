'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Camera, Maximize2, Square, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function LivePreview() {
    const { currentFrame, streamStatus, streamActive } = useStore();
    const [isPaused, setIsPaused] = useState(false);

    const handleScreenshot = () => {
        if (currentFrame) {
            const link = document.createElement('a');
            link.href = currentFrame;
            link.download = `browuser-snap-${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white/60 tracking-wider uppercase flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-electric shadow-[0_0_10px_#06b6d4]" />
                    Live Browser View
                </h2>
                <div className="flex items-center gap-2">
                    {streamStatus === 'active' ? (
                        <>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs text-red-500 font-bold animate-pulse">LIVE</span>
                        </>
                    ) : streamStatus === 'connecting' ? (
                        <span className="text-xs text-yellow-500 flex items-center gap-1"><Wifi size={12} /> Connecting...</span>
                    ) : (
                        <span className="text-xs text-white/30 flex items-center gap-1"><WifiOff size={12} /> Idle</span>
                    )}
                </div>
            </div>

            <div className={cn(
                "aspect-video rounded-xl overflow-hidden relative bg-black border transition-all duration-500",
                streamActive
                    ? "border-cyan-electric shadow-[0_0_40px_rgba(6,182,212,0.2)]"
                    : "border-white/10"
            )}>
                <AnimatePresence mode="wait">
                    {currentFrame && !isPaused ? (
                        <motion.img
                            key="stream"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={currentFrame}
                            alt="Live Stream"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-white/20"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-4 animate-pulse">
                                <div className="w-2 h-2 bg-white/20 rounded-full" />
                            </div>
                            <p className="text-sm font-mono">Waiting for task...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 hover:opacity-100 transition-opacity flex justify-center gap-4 backdrop-blur-sm">
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5"
                        title={isPaused ? "Resume" : "Pause"}
                    >
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button
                        onClick={handleScreenshot}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5"
                        title="Take Screenshot"
                    >
                        <Camera size={16} />
                    </button>
                    <button
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5"
                        title="Fullscreen"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button
                        className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors border border-red-500/20"
                        title="Stop Task"
                    >
                        <Square size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
