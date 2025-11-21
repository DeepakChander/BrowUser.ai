'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Line } from '@react-three/drei';
import { Zap, Eye, ShieldCheck, ArrowRight, Terminal } from 'lucide-react';
import * as THREE from 'three';

// --- 3D Components ---

function MovingGrid() {
    const gridRef = useRef();

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.z = (state.clock.getElapsedTime() * 2) % 2;
        }
    });

    return (
        <group position={[0, -2, 0]}>
            <gridHelper
                ref={gridRef}
                args={[60, 60, 0x000000, 0xe5e7eb]}
            />
            <fog attach="fog" args={['#ffffff', 5, 20]} />
        </group>
    );
}

function NeuralNetwork() {
    const groupRef = useRef();

    const nodes = React.useMemo(() => {
        const temp = [];
        for (let i = 0; i < 20; i++) {
            temp.push(new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 5
            ));
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
        }
    });

    return (
        <group ref={groupRef}>
            {nodes.map((pos, i) => (
                <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <mesh position={pos}>
                        <icosahedronGeometry args={[0.15, 0]} />
                        <meshStandardMaterial
                            color="#000000"
                            emissive="#06b6d4"
                            emissiveIntensity={0.2}
                            wireframe
                        />
                    </mesh>
                </Float>
            ))}
            {nodes.map((pos, i) => {
                const nextPos = nodes[(i + 1) % nodes.length];
                return (
                    <Line
                        key={i}
                        points={[pos, nextPos]}
                        color="#e5e7eb"
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                    />
                );
            })}
        </group>
    );
}

function Scene() {
    const cameraRef = useRef();

    useFrame(({ mouse }) => {
        if (cameraRef.current) {
            cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, mouse.x * 0.5, 0.05);
            cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, mouse.y * 0.5, 0.05);
            cameraRef.current.lookAt(0, 0, 0);
        }
    });

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 6]} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <MovingGrid />
            <NeuralNetwork />
        </>
    );
}

// --- Main Component ---

export default function ProductionLandingPage() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-white text-black font-sans selection:bg-cyan-100">

            {/* 3D Background Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Scene />
                </Canvas>
            </div>

            {/* --- UI Overlay Layers --- */}

            {/* 1. Top Right Navigation (Auth) */}
            <div className="absolute top-0 right-0 z-50 p-6 flex items-center space-x-4">
                <a
                    href="http://localhost:5000/auth/google"
                    className="px-5 py-2.5 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-lg border border-gray-200
                   hover:border-gray-400 hover:bg-white transition-all duration-200 text-sm shadow-sm"
                >
                    Sign In
                </a>
                <a
                    href="http://localhost:5000/auth/google"
                    className="group relative px-6 py-2.5 bg-black text-white font-bold rounded-lg overflow-hidden 
                   transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 text-sm"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="relative flex items-center gap-2">
                        Start Free - Sign Up
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </a>
            </div>

            {/* Main Content Container */}
            <div className="absolute inset-0 z-10 container mx-auto px-6 flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">

                    {/* 2. Hero Content Block (Center-Left) */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
                        <div className="inline-flex items-center space-x-2 bg-gray-100/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit border border-gray-200">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">v1.0 Public Beta</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-black">
                                The Only AI That Works Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-600 to-black">ALL Your Tabs.</span>
                            </h1>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                BrowUser.ai: The Universal Agent That Automates Your Digital World.
                            </h2>
                        </div>

                        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed font-medium">
                            Stop juggling tokens and tabs. Our Neural Browser Engine securely connects your Google services, Supabase, GitHub, and more, allowing you to execute complex workflows in a single chat command. See the automation happen with our <span className="text-cyan-600 font-bold underline decoration-cyan-300 decoration-2 underline-offset-2">Live Preview</span>.
                        </p>

                        <div className="flex items-center space-x-4 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-gray-500">Trusted by 500+ early adopters</p>
                        </div>
                    </div>

                    {/* 3. Feature Visualization (Center-Right) */}
                    <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
                                <Terminal size={24} className="text-black" />
                                <span className="font-bold text-lg">System Capabilities</span>
                            </div>

                            <div className="space-y-6">
                                {/* USP 1 */}
                                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-lg">
                                    <div className="p-3 rounded-xl bg-black text-cyan-400 shadow-md group-hover:scale-110 transition-transform">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Instant Workflows</h3>
                                        <p className="text-sm text-gray-500 font-medium">20x Faster Execution than manual input</p>
                                    </div>
                                </div>

                                {/* USP 2 */}
                                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-lg">
                                    <div className="p-3 rounded-xl bg-black text-cyan-400 shadow-md group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Zero-Friction Integration</h3>
                                        <p className="text-sm text-gray-500 font-medium">Secure SSO Across All Tools</p>
                                    </div>
                                </div>

                                {/* USP 3 */}
                                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-lg">
                                    <div className="p-3 rounded-xl bg-black text-cyan-400 shadow-md group-hover:scale-110 transition-transform">
                                        <Eye size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Total Transparency</h3>
                                        <p className="text-sm text-gray-500 font-medium">Live Visual Proof in Chat</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
