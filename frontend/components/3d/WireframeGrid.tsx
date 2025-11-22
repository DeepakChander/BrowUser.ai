'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Grid() {
    const mesh = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Subtle movement
        mesh.current.position.z = (t * 0.1) % 1;
    });

    return (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <gridHelper args={[40, 40, 0x22d3ee, 0x111111]} position={[0, 0, 0]} />
            <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[40, 40]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.9} />
            </mesh>
        </group>
    );
}

function FloatingNodes() {
    // Simple floating glowing orbs
    return (
        <group>
            <mesh position={[-2, 0, -5]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[2, 1, -3]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#22d3ee" />
            </mesh>
        </group>
    )
}

export default function WireframeGrid() {
    return (
        <div className="absolute inset-0 -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
                <fog attach="fog" args={['#050505', 2, 15]} />
                <Grid />
                <FloatingNodes />
            </Canvas>
        </div>
    );
}
