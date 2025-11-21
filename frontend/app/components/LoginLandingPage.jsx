'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Float, Line } from '@react-three/drei';
import { Zap, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

// --- 3D Components ---

function MovingGrid() {
    const gridRef = useRef();

    useFrame((state) => {
        if (gridRef.current) {
            // Move the grid towards the camera to simulate forward motion
            gridRef.current.position.z = (state.clock.getElapsedTime() * 2) % 2;
        }
    });

    return (
        <group position={[0, -2, 0]}>
            <gridHelper
                ref={gridRef}
                args={[60, 60, 0x000000, 0xe5e7eb]}
            />
            {/* Fog to fade the grid into the distance */}
            <fog attach="fog" args={['#ffffff', 5, 20]} />
        </group>
    );
}

function NeuralNetwork() {
    const groupRef = useRef();

    // Generate random node positions
    const nodes = React.useMemo(() => {
        const temp = [];
        for (let i = 0; i < 15; i++) {
            temp.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5
            ));
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            // Slowly rotate the entire network
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Render Nodes */}
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

            {/* Render Connections (Lines between close nodes) */}
            {nodes.map((pos, i) => {
                // Connect to the next few nodes to create a web
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
            // Mouse Parallax Effect
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

export default function LoginLandingPage() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-white text-black font-sans selection:bg-cyan-100">

            {/* 3D Background Layer */}
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Scene />
                </Canvas>
            </div>

            {/* UI Overlay Layer */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">

                {/* Glassmorphism Card */}
                <div className="relative w-full max-w-lg p-10 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl transform transition-all hover:shadow-[0_0_40px_rgba(0,0,0,0.05)]">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black tracking-tighter mb-2 text-black">
                            BrowUser.ai
                        </h1>
                        <p className="text-xl font-bold text-gray-900 mb-1">
                            The Only AI That Works Across ALL Your Tabs.
                        </p>
                        <p className="text-md text-cyan-600 font-medium uppercase tracking-widest text-xs">
                            Your Universal Automation Agent
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-5 mb-10">
                        <div className="flex items-center space-x-4 group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="p-2.5 rounded-lg bg-black text-cyan-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Zap size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-gray-800">20x Faster Execution</span>
                        </div>

                        <div className="flex items-center space-x-4 group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="p-2.5 rounded-lg bg-black text-cyan-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Eye size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Live Visual Proof</span>
                        </div>

                        <div className="flex items-center space-x-4 group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="p-2.5 rounded-lg bg-black text-cyan-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheck size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Secure SSO Across All Tools</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {/* Primary CTA: Sign Up */}
                        <a
                            href="http://localhost:5000/auth/google"
                            className="group relative flex items-center justify-center w-full py-4 px-6 bg-black text-white text-lg font-bold rounded-xl 
                       overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <span className="relative flex items-center gap-2">
                                Start Free - Sign Up with Google
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </a>

                        {/* Secondary CTA: Sign In */}
                        <a
                            href="http://localhost:5000/auth/google"
                            className="block w-full py-3 px-6 bg-white text-gray-900 text-center font-semibold rounded-xl border-2 border-gray-100
                       hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm"
                        >
                            Existing User? Sign In Here
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-4">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            By continuing, you enable the Agent to act on your linked accounts.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
