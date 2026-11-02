"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getTierTheme } from '../data/theme/tierThemes';
import { useGameStore } from '../store/useGameStore';
import { FallingPetals } from './FallingPetals';

const DEFAULT_BG = 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)';
const DEFAULT_PETAL_COLOR = '#DF7956';

export const GlobalBackground: React.FC = () => {
    const pathname = usePathname();
    const isQuizActive = useGameStore(state => state.isQuizActive);

    const { targetBg, targetPetalColor } = useMemo(() => {
        if (!pathname) return { targetBg: DEFAULT_BG, targetPetalColor: DEFAULT_PETAL_COLOR };
        const parts = pathname.split('/').filter(Boolean);
        // Pattern: /stage/[category]/[groupId]
        if (parts[0] === 'stage' && parts.length >= 3) {
            const category = (parts[1] === 'katakana' ? 'katakana' : 'hiragana') as 'hiragana' | 'katakana';
            const groupId = parts[2];
            const theme = getTierTheme(category, groupId);
            return {
                targetBg: theme.room.pageBgGradient || DEFAULT_BG,
                targetPetalColor: theme.room.petalBg || DEFAULT_PETAL_COLOR,
            };
        }
        return { targetBg: DEFAULT_BG, targetPetalColor: DEFAULT_PETAL_COLOR };
    }, [pathname]);

    const [activeBg, setActiveBg] = useState(targetBg);
    const [prevBg, setPrevBg] = useState<string | null>(null);
    const [fadeKey, setFadeKey] = useState(0);
    const prevTargetRef = useRef(targetBg);

    useEffect(() => {
        if (targetBg !== prevTargetRef.current) {
            const oldBg = prevTargetRef.current;
            prevTargetRef.current = targetBg;
            setPrevBg(oldBg);
            setActiveBg(targetBg);
            setFadeKey(prev => prev + 1);

            const timer = setTimeout(() => {
                setPrevBg(null);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [targetBg]);

    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            {/* Previous gradient layer (stays visible under the new one while it fades in) */}
            {prevBg && (
                <div 
                    className="absolute inset-0"
                    style={{ background: prevBg }}
                />
            )}
            
            {/* Active gradient layer (fades in smoothly over previous) */}
            <div 
                key={fadeKey}
                className="absolute inset-0"
                style={{ 
                    background: activeBg,
                    animation: prevBg ? 'globalBgFadeIn 0.6s ease-in-out forwards' : undefined,
                }}
            />

            {/* Falling subtle petals & particles */}
            <FallingPetals color={targetPetalColor} isDimmed={isQuizActive} />

            <style jsx global>{`
                @keyframes globalBgFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

