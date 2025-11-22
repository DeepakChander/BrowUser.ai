'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import * as random from 'maath/random/dist/maath-random.esm';

function Nodes(props: any) {
    const ref = useRef<any>();
    // Generate random points in a sphere
    const sphere = useMemo(() => random.inSphere(new Float32Array(300), { radius: 1.2 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#06b6d4" // Cyan
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

function Connections() {
    // Simplified connections for performance - static lines for now or could be dynamic
    // For this demo, we'll stick to just nodes to ensure performance, 
    // or add a subtle wireframe sphere
    return (
        <mesh rotation={[0, 0, Math.PI / 4]}>
            <icosahedronGeometry args={[1.2, 1]} />
            <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.05} />
        </mesh>
    )
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 -z-10 bg-white">
            <Canvas camera={{ position: [0, 0, 2] }}>
                <Nodes />
                <Connections />
            </Canvas>
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/80" />
        </div>
    );
}
