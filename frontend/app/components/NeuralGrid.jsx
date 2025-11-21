'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NeuralGridPoints({ blur = false, intensity = 1.0 }) {
    const ref = useRef();
    const particleCount = 2000;

    // Generate random positions for particles
    const positions = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return positions;
    }, []);

    // Animate particles
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.05;
            ref.current.rotation.y = state.clock.elapsedTime * 0.075;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00ffff"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={blur ? 0.3 : intensity}
            />
        </Points>
    );
}

export default function NeuralGrid({ blur = false, intensity = 1.0 }) {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                className={blur ? 'blur-md' : ''}
            >
                <ambientLight intensity={0.5} />
                <NeuralGridPoints blur={blur} intensity={intensity} />
            </Canvas>
        </div>
    );
}
