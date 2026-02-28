"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function ArenaOrb() {
    return (
        // Make sure the wrapper is strictly relative and transparent
        <div className="relative w-full h-[500px] flex items-center justify-center bg-transparent">

            {/* 🟢 THE FOOLPROOF GLOW */}
            {/* This pure CSS circle creates a perfect neon bloom behind the 3D object without any WebGL bounding box bugs. */}
            <div className="absolute w-[350px] h-[350px] bg-[#F0B90B] rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none z-0" />

            {/* 🟢 THE TRANSPARENT 3D CANVAS */}
            <Canvas gl={{ alpha: true, antialias: true }} className="relative z-10">

                {/* Slightly boosted light so the wireframe pops against the CSS glow */}
                <ambientLight intensity={2} />

                <Sphere visible args={[1, 48, 48]} scale={2.2}>
                    <MeshDistortMaterial
                        color="#F0B90B"
                        attach="material"
                        distort={0.4}
                        speed={1.5}
                        wireframe={true}
                        transparent={true}
                        opacity={0.9} // Slight transparency on the wires themselves helps them blend 
                    />
                </Sphere>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
            </Canvas>

        </div>
    );
}
