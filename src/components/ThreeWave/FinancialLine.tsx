"use client";

import { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html, Sparkles, Float } from '@react-three/drei';
import { format, addDays } from 'date-fns';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SmoothLine } from './SmoothLine';

// --- CORE VISUALIZATION: Straight, Honest, Glowing Lines ---
export function FinancialLine({ startDate, showGoldenPath = false, onNodeClick }: { startDate: Date, showGoldenPath?: boolean, onNodeClick?: (event: any) => void }) {
    const { events, proposedEvents, user } = useStore();
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

    const markerGroupRef = useRef<THREE.Group>(null);

    const todayTime = new Date(2026, 1, 28).getTime();
    const DAYS_SHOWN = 14;
    const X_SPACING = 16 / DAYS_SHOWN; // 16 units covers the screen perfectly (-8 to +8)

    const { rawPoints, markers, targetX, targetMidY, targetScaleY, trend, hasDanger } = useMemo(() => {
        const sortedEvents = [...events].sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

        let currentBal = user.currentBalance;
        const pts: THREE.Vector3[] = [];
        const mkrs: any[] = [];

        // Anchor deep in the past
        pts.push(new THREE.Vector3(-100, currentBal, 0));

        // 1. GENERATE PRECISE, STRAIGHT DATA POINTS (Step Chart)
        sortedEvents.forEach((e: any) => {
            const daysFromToday = (e.start.getTime() - todayTime) / 86400000;
            let x = daysFromToday * X_SPACING;

            // Prevent exact overlaps so the line drops vertically, but doesn't glitch
            if (pts.length > 0 && x <= pts[pts.length - 1].x) {
                x = pts[pts.length - 1].x + 0.05;
            }

            // STEP 1: Add a point at the OLD balance at the NEW x position
            // This creates a horizontal line to the transition point
            if (pts.length > 0) {
                pts.push(new THREE.Vector3(x, currentBal, 0));
            }

            // Update balance
            if (e.type === 'income') currentBal += e.predictedCost;
            else currentBal -= e.predictedCost;

            // STEP 2: Add a point at the NEW balance at the SAME x position
            // This creates a perfect vertical step (no diagonal!)
            pts.push(new THREE.Vector3(x, currentBal, 0));

            if (e.status !== 'safe') {
                mkrs.push({ ...e, rawX: x, rawY: currentBal, realBalance: currentBal });
            }
        });

        // Anchor deep in the future
        const lastX = pts.length > 0 ? pts[pts.length - 1].x : 0;
        pts.push(new THREE.Vector3(lastX + 100, currentBal, 0));

        // 2. ABSOLUTE VIEWPORT FRAMING
        const winStartX = ((startDate.getTime() - todayTime) / 86400000) * X_SPACING;
        const winEndX = winStartX + (DAYS_SHOWN * X_SPACING);

        let startBal = user.currentBalance;
        for (const p of pts) {
            if (p.x <= winStartX) startBal = p.y;
        }

        let minBal = startBal;
        let maxBal = startBal;
        let windowDanger = false;
        let periodChange = 0;

        for (const p of pts) {
            if (p.x >= winStartX && p.x <= winEndX) {
                if (p.y < minBal) minBal = p.y;
                if (p.y > maxBal) maxBal = p.y;
            }
        }

        sortedEvents.forEach((e: any) => {
            const t = e.start.getTime();
            if (t >= startDate.getTime() && t <= startDate.getTime() + (14 * 86400000)) {
                if (e.status === 'danger') windowDanger = true;
                if (e.type === 'income') periodChange += e.predictedCost;
                else periodChange -= e.predictedCost;
            }
        });

        const padding = Math.max((maxBal - minBal) * 0.15, 200);
        const viewMax = maxBal + padding;
        const viewMin = minBal - padding;

        const midY = (viewMax + viewMin) / 2;
        const scaleY = 4.0 / (viewMax - viewMin || 1);
        const panX = -winStartX - 8;

        return {
            rawPoints: pts, markers: mkrs,
            targetX: panX, targetMidY: midY, targetScaleY: scaleY,
            trend: periodChange, hasDanger: windowDanger
        };
    }, [events, user.currentBalance, startDate]);

    const viewState = useRef({ x: targetX, midY: targetMidY, scaleY: targetScaleY });
    const waveColor = hasDanger ? new THREE.Color(4, 0.2, 0.2) : trend < 0 ? new THREE.Color(4, 3, 0.2) : new THREE.Color(0.2, 4, 0.8);

    const proposedRawPoints = useMemo(() => {
        if (!showGoldenPath || proposedEvents.length === 0) return [];
        const sorted = [...proposedEvents].sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
        // We start with the original balance BEFORE the fracture subtracted it
        let currentBal = user.currentBalance + 300;
        const pts: THREE.Vector3[] = [new THREE.Vector3(-100, currentBal, 0)];
        const todayTime = new Date(2026, 1, 28).getTime();
        const X_SPACING = 16 / 14;

        sorted.forEach((e: any) => {
            const x = ((e.start.getTime() - todayTime) / 86400000) * X_SPACING;
            pts.push(new THREE.Vector3(x, currentBal, 0));
            if (e.type === 'income') currentBal += e.predictedCost;
            else currentBal -= e.predictedCost;
            pts.push(new THREE.Vector3(x, currentBal, 0));
        });
        pts.push(new THREE.Vector3(pts[pts.length - 1].x + 100, currentBal, 0));
        return pts;
    }, [proposedEvents, showGoldenPath, user.currentBalance]);
    // 3. THE ANIMATION ENGINE - Create new point arrays for smooth line rendering
    const [renderTrigger, setRenderTrigger] = useState(0);
    const animatedPointsRef = useRef<THREE.Vector3[]>([]);
    const animatedProposedPointsRef = useRef<THREE.Vector3[]>([]);

    // Initialize the points array when rawPoints changes
    useMemo(() => { animatedPointsRef.current = rawPoints.map(p => new THREE.Vector3(p.x, p.y, p.z)); }, [rawPoints]);
    useMemo(() => { animatedProposedPointsRef.current = proposedRawPoints.map(p => new THREE.Vector3(p.x, p.y, p.z)); }, [proposedRawPoints]);
    useFrame(() => {
        // Smoothly pan and zoom to the mathematically perfect targets
        viewState.current.x = THREE.MathUtils.lerp(viewState.current.x, targetX, 0.08);
        viewState.current.midY = THREE.MathUtils.lerp(viewState.current.midY, targetMidY, 0.08);
        viewState.current.scaleY = THREE.MathUtils.lerp(viewState.current.scaleY, targetScaleY, 0.08);

        // Update animated points - create new arrays for proper Line re-rendering
        const points = animatedPointsRef.current;
        for (let i = 0; i < rawPoints.length; i++) {
            const p = rawPoints[i];
            if (points[i]) {
                points[i].set(
                    p.x + viewState.current.x,
                    (p.y - viewState.current.midY) * viewState.current.scaleY,
                    p.z
                );
            }
        }

        // Update the golden points with the same camera pan/zoom
        const pPts = animatedProposedPointsRef.current;
        for (let i = 0; i < proposedRawPoints.length; i++) {
            const p = proposedRawPoints[i];
            if (pPts[i]) {
                pPts[i].set(p.x + viewState.current.x, (p.y - viewState.current.midY) * viewState.current.scaleY, p.z);
            }
        }

        // Trigger re-render to update the Line component
        setRenderTrigger(t => t + 1);

        // Move markers
        if (markerGroupRef.current) {
            markerGroupRef.current.children.forEach((child: any, index) => {
                const raw = markers[index];
                if (raw) {
                    child.position.x = raw.rawX + viewState.current.x;
                    child.position.y = (raw.rawY - viewState.current.midY) * viewState.current.scaleY;
                }
            });
        }
    });

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const handlePointerOver = (e: any, id: string) => {
        e.stopPropagation();
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setHoveredMarker(id);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => {
            setHoveredMarker(null);
            document.body.style.cursor = 'auto';
        }, 300); // 300ms delay before hiding to prevent flicker
    };

    return (
        <group>
            {/* Background Grid & Axes */}
            {/* Y-Axis: Balance Grid Lines */}
            {[-2, 0, 2].map((yOffset) => {
                const balanceVal = Math.round(targetMidY + yOffset / targetScaleY);
                return (
                    <group key={`y-axis-${yOffset}`}>
                        <Line points={[new THREE.Vector3(-12, yOffset, -2.5), new THREE.Vector3(12, yOffset, -2.5)]} color="#1e293b" lineWidth={1.5} dashed={true} dashScale={5} transparent opacity={0.5} />
                        <Html position={[-8.8, yOffset + 0.1, 0]} center distanceFactor={10} zIndexRange={[1, 0]}>
                            <span className="text-xs text-slate-500/60 font-mono whitespace-nowrap pr-2">
                                ${balanceVal.toLocaleString()}
                            </span>
                        </Html>
                    </group>
                );
            })}

            {/* X-Axis: Date Grid Lines */}
            {Array.from({ length: DAYS_SHOWN + 1 }).map((_, i) => {
                const xPos = -8 + i * X_SPACING;
                return (
                    <group key={`x-axis-${i}`}>
                        <Line points={[new THREE.Vector3(xPos, -4, -2.5), new THREE.Vector3(xPos, 4, -2.5)]} color="#1e293b" lineWidth={1} dashed={true} dashScale={5} transparent opacity={0.3} />
                        <Html position={[xPos, -3.3, 0]} center distanceFactor={10} zIndexRange={[1, 0]}>
                            <span className="text-xs sm:text-sm text-slate-500 font-mono whitespace-nowrap opacity-75">
                                {format(addDays(startDate, i), 'MM/dd')}
                            </span>
                        </Html>
                    </group>
                );
            })}

            <Sparkles count={100} scale={[24, 12, 4]} position={[0, 0, -2]} size={1.5} speed={0.2} color={hasDanger ? "#fca5a5" : "#6ee7b7"} opacity={0.3} />

            {/* The Straight, Glowing Line - Using Drei's Line (Line2) for anti-aliased rendering */}
            <SmoothLine points={animatedPointsRef.current} color={waveColor} lineWidth={4} version={renderTrigger} />
            {/* The Golden AI Path */}
            {showGoldenPath && animatedProposedPointsRef.current.length > 0 && (
                <SmoothLine points={animatedProposedPointsRef.current} color={new THREE.Color(4, 3, 0.5)} lineWidth={3} dashed={true} version={renderTrigger} />
            )}
            {/* Dynamic Markers */}
            <group ref={markerGroupRef}>
                {markers.map((marker, i) => {
                    const isHovered = hoveredMarker === marker.id;
                    return (
                        <group
                            key={`${marker.id}-${i}`}
                            onPointerOver={(e) => handlePointerOver(e, marker.id)}
                            onPointerOut={handlePointerOut}
                            onClick={(e) => { e.stopPropagation(); if (onNodeClick) onNodeClick(marker); }}
                        >
                            {marker.status === 'danger' ? (
                                <Float speed={1} rotationIntensity={2} floatIntensity={1}>
                                    <mesh><icosahedronGeometry args={[isHovered ? 0.2 : 0.15, 0]} /><meshBasicMaterial color={[5, 0, 0]} wireframe toneMapped={false} /></mesh>
                                </Float>
                            ) : marker.status === 'warning' ? (
                                <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
                                    <mesh><octahedronGeometry args={[isHovered ? 0.2 : 0.15]} /><meshBasicMaterial color={[2, 2, 0]} toneMapped={false} /></mesh>
                                </Float>
                            ) : (
                                <Float speed={1} rotationIntensity={0.5} floatIntensity={0.2}>
                                    <mesh><boxGeometry args={[isHovered ? 0.3 : 0.25, isHovered ? 0.3 : 0.25, isHovered ? 0.3 : 0.25]} /><meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} /></mesh>
                                </Float>
                            )}

                            {isHovered && (
                                <Html center distanceFactor={10} zIndexRange={[100, 0]}>
                                    <div className={`w-56 p-3 rounded-lg shadow-xl backdrop-blur-md border text-white text-sm pointer-events-none transform -translate-y-12 transition-opacity duration-300
                    ${marker.status === 'danger' ? 'bg-red-950/90 border-red-500/50' : marker.status === 'warning' ? 'bg-amber-950/90 border-amber-500/50' : 'bg-slate-800/90 border-slate-500/50'}
                    ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <div className="font-bold text-xs opacity-70 mb-1">{format(marker.start, 'MMM do, h:mm a')}</div>
                                        <div className="font-bold leading-tight">{marker.title}</div>
                                        <div className="mt-2 flex justify-between items-center pb-2 border-b border-white/10">
                                            <span className={`font-mono text-lg ${marker.type === 'income' ? 'text-emerald-400' : marker.status === 'danger' ? 'text-red-400' : 'text-amber-400'}`}>
                                                {marker.type === 'income' ? '+' : '-'}${marker.predictedCost}
                                            </span>
                                            <span className="text-xs text-slate-400 bg-slate-950/50 px-2 py-1 rounded">Bal: ${marker.realBalance.toFixed(0)}</span>
                                        </div>
                                        {(marker.status === 'warning' || marker.status === 'danger') && (
                                            <div className="mt-2 text-xs font-semibold text-center animate-pulse text-indigo-300">
                                                <SparklesIcon className="inline-block w-3 h-3 mr-1" />
                                                Click for AI advice
                                            </div>
                                        )}
                                    </div>
                                </Html>
                            )}
                        </group>
                    );
                })}
            </group>
        </group>
    );
}
