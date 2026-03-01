"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Environment } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

// The actual glowing wave logic
// Inside ThreeWave.tsx, update the WaveLines component:

function WaveLines() {
  const { events } = useStore();
  const lineRef = useRef<any>();

  // Find Amir's event to check if we are in danger or if we healed it
  const amirEvent = events.find((e: any) => e.id === 3);
  const isDanger = amirEvent?.status === 'danger';

  const points = useMemo(() => {
    return [
      new THREE.Vector3(-5, 2, 0),   
      new THREE.Vector3(-3, 1.8, 0), 
      // THE MAGIC HAPPENS HERE:
      // If in danger, dip down to 0.5. If healed, pull up to 1.5!
      new THREE.Vector3(-1, isDanger ? 0.5 : 1.5, 0), 
      new THREE.Vector3(1, isDanger ? 0.5 : 1.4, 0),  
      new THREE.Vector3(3, isDanger ? -0.5 : 1.2, 0), 
      new THREE.Vector3(5, isDanger ? -1 : 1.0, 0),   
    ];
  }, [isDanger]); // Recalculate the 3D line when isDanger changes

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Income Line (The Blue Dotted Boundary) */}
      <Line
        points={[
          new THREE.Vector3(-6, 2, -1),
          new THREE.Vector3(6, 2, -1),
        ]}
        color="#3b82f6"
        lineWidth={3}
        dashed={true}
        opacity={0.5}
      />
      
      {/* Expense Wave */}
      <Line
        ref={lineRef}
        points={points}
        color={isDanger ? "#818cf8" : "#10b981"} // Turns green when healed!
        lineWidth={8}   
        curveType="catmullrom" 
        tension={0.5}
      />
      
      {/* The Danger Sphere (Only renders if we are in danger) */}
      {isDanger && (
        <mesh position={[-1, 0.5, 0.1]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}

export default function ThreeWave() {
    return (
        <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden relative shadow-inner">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                <WaveLines />

                {/* Allows judges to drag to look around, but prevents them from breaking the camera angle */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
                <Environment preset="city" />
            </Canvas>

            {/* UI Overlay on top of the 3D Canvas */}
            <div className="absolute top-4 left-4 text-white">
                <div className="text-xs uppercase tracking-widest text-slate-400">Wave Health</div>
                <div className="text-2xl font-bold text-emerald-400">84%</div>
            </div>
        </div>
    );
}