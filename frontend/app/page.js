'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NeuralGrid from './components/NeuralGrid';
import FloatingNav from './components/FloatingNav';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import ProfileView from './components/ProfileView';

export default function Home() {
    const [activeRoute, setActiveRoute] = useState('landing');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        const userId = localStorage.getItem('browuser_uid');
        if (userId) {
            setIsAuthenticated(true);
            setActiveRoute('dashboard');
        }
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('browuser_uid');
        localStorage.removeItem('browuser_email');
        setIsAuthenticated(false);
        setActiveRoute('landing');
    };

    // Determine 3D background properties based on route
    const get3DProps = () => {
        switch (activeRoute) {
            case 'landing':
                return { blur: false, intensity: 1.0 };
            case 'login':
            case 'signup':
                return { blur: true, intensity: 0.5 };
            case 'dashboard':
            case 'profile':
                return { blur: false, intensity: 0.3 };
            default:
                return { blur: false, intensity: 1.0 };
        }
    };

    return (
        <main className="relative min-h-screen bg-black overflow-x-hidden">
            {/* Persistent 3D Background */}
            <NeuralGrid {...get3DProps()} />

            {/* Floating Navigation */}
            <FloatingNav
                activeRoute={activeRoute}
                setActiveRoute={setActiveRoute}
                isAuthenticated={isAuthenticated}
                onLogout={handleLogout}
            />

            {/* View Router with Transitions */}
            <AnimatePresence mode="wait">
                {activeRoute === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LandingView setActiveRoute={setActiveRoute} />
                    </motion.div>
                )}

                {(activeRoute === 'login' || activeRoute === 'signup') && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                    >
                        <AuthView setActiveRoute={setActiveRoute} />
                    </motion.div>
                )}

                {activeRoute === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <DashboardView setActiveRoute={setActiveRoute} />
                    </motion.div>
                )}

                {activeRoute === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <ProfileView setActiveRoute={setActiveRoute} />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
