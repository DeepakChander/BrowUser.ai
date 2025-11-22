'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export function useWebSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const {
        user,
        setStreamActive,
        setStreamStatus,
        setCurrentFrame,
        addTask,
        updateTask
    } = useStore();

    // Event listeners storage
    const listenersRef = useRef<Record<string, Function[]>>({});

    const on = (event: string, callback: Function) => {
        if (!listenersRef.current[event]) {
            listenersRef.current[event] = [];
        }
        listenersRef.current[event].push(callback);
    };

    const emit = (event: string, data: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: event, ...data }));
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        const wsUrl = `ws://localhost:5000/ws/live-preview/${user.id}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to backend');
            setStreamStatus('idle');
            trigger('connect', null);
        };

        ws.onmessage = (event) => {
            try {
                // Handle binary data (frames)
                if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result as string;
                        setCurrentFrame(base64);
                        setStreamActive(true);
                        setStreamStatus('active');
                        trigger('frame', base64);
                    };
                    reader.readAsDataURL(event.data);
                    return;
                }

                // Handle text data (JSON)
                const message = JSON.parse(event.data);

                // Dispatch to listeners
                trigger(message.type, message.data || message);

                // Global handlers
                if (message.type === 'log') {
                    // Log handling is done in ThoughtLog component via listener
                }

                if (message.type === 'task_complete') {
                    setStreamStatus('idle');
                    setStreamActive(false);
                }

            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected');
            setStreamStatus('error');
            trigger('disconnect', null);
        };

        ws.onerror = (err) => {
            console.error('WS Error', err);
            setStreamStatus('error');
        };

        return () => {
            ws.close();
        };
    }, [user?.id]);

    const trigger = (event: string, data: any) => {
        if (listenersRef.current[event]) {
            listenersRef.current[event].forEach(cb => cb(data));
        }
    };

    return { socket: { on, emit } };
}
