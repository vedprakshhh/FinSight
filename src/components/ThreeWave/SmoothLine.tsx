"use client";
import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

export function SmoothLine({ points, color, lineWidth = 3, version = 0, dashed = false }: { points: THREE.Vector3[], color: THREE.Color, lineWidth?: number, version?: number, dashed?: boolean }) {
    const pointArray = useMemo(() => {
        if (!points || points.length === 0) return [];
        return points.map(p => [p.x, p.y, p.z] as [number, number, number]);
    }, [points, version]);

    if (pointArray.length < 2) return null;

    return (
        <Line
            points={pointArray}
            color={color}
            lineWidth={lineWidth}
            toneMapped={false}
            dashed={dashed}
            dashSize={dashed ? 0.5 : undefined}
            gapSize={dashed ? 0.2 : undefined}
        />
    );
}