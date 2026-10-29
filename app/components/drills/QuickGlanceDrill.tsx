"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import GlanceTimerBar from './GlanceTimerBar';

interface QuickGlanceDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
    totalPairs?: number;
    matchCount?: number;
    barIntervalSeconds?: number;
    columns?: number;
}

type PairData = {
    id: number;
    kana: string;
    romaji: string;
    isMatch: boolean;
};

const DEFAULT_TOTAL_PAIRS = 60;
const DEFAULT_MATCH_COUNT = 6;
const DEFAULT_TIME_LIMIT_MS = 10000;

const QuickGlanceDrill: React.FC<QuickGlanceDrillProps> = ({ 
    groupChars, 
    onCorrect, 
    onWrong, 
    isSansSerif, 
    isActive,
    totalPairs: propTotalPairs,
    matchCount: propMatchCount,
    barIntervalSeconds,
    columns: propColumns,
}) => {
    const totalPairs = propTotalPairs ?? DEFAULT_TOTAL_PAIRS;
    const matchCount = propMatchCount ?? DEFAULT_MATCH_COUNT;
    const timeLimitMs = barIntervalSeconds ? barIntervalSeconds * 1000 : DEFAULT_TIME_LIMIT_MS;
    const columns = propColumns ?? (totalPairs === 36 || totalPairs === 45 ? 9 : (totalPairs <= 40 ? 10 : 15));
    
    // Generate a mismatch pair
    const generateMismatch = useCallback(() => {
        const kanaItem = groupChars[Math.floor(Math.random() * groupChars.length)];
        let romajiOptions = groupChars.filter(c => c.r !== kanaItem.r);
        if (romajiOptions.length === 0) romajiOptions = groupChars; // Fallback
        const romajiItem = romajiOptions[Math.floor(Math.random() * romajiOptions.length)];
        return { kana: kanaItem.k, romaji: romajiItem.r, isMatch: false };
    }, [groupChars]);

    // Generate a match pair
    const generateMatch = useCallback(() => {
        const char = groupChars[Math.floor(Math.random() * groupChars.length)];
        return { kana: char.k, romaji: char.r, isMatch: true };
    }, [groupChars]);

    const initializeBoard = useCallback(() => {
        let initialPairs: PairData[] = [];
        
        let matchIndices = new Set<number>();
        let attempts = 0;
        
        while(matchIndices.size < matchCount && attempts < 1000) {
            attempts++;
            const idx = Math.floor(Math.random() * totalPairs);
            // Enforce no adjacent matches
            if (!matchIndices.has(idx) && !matchIndices.has(idx - 1) && !matchIndices.has(idx + 1)) {
                matchIndices.add(idx);
            }
        }
        // Fallback in case of extremely bad RNG
        while (matchIndices.size < matchCount) {
            const idx = Math.floor(Math.random() * totalPairs);
            matchIndices.add(idx);
        }

        for (let i = 0; i < totalPairs; i++) {
            if (matchIndices.has(i)) {
                initialPairs.push({ id: i, ...generateMatch() });
            } else {
                initialPairs.push({ id: i, ...generateMismatch() });
            }
        }
        return initialPairs;
    }, [generateMatch, generateMismatch, matchCount, totalPairs]);

    const [pairs, setPairs] = useState<PairData[]>(() => initializeBoard());
    const [resetSignal, setResetSignal] = useState(0);

    // Initialize board if empty
    useEffect(() => {
        if (pairs.length === 0) {
            setPairs(initializeBoard());
        }
    }, [pairs.length, initializeBoard]);

    const handlePairClick = (index: number) => {
        if (!isActive) return;

        const clickedPair = pairs[index];
        if (!clickedPair.isMatch) {
            // Clicked a mismatch!
            onWrong();
            setResetSignal(prev => prev + 1);
            return;
        }

        // Correct!
        onCorrect();
        setResetSignal(prev => prev + 1);

        setPairs(prev => {
            const newPairs = [...prev];
            
            // 1. Find all existing matches EXCEPT the one we just clicked
            const existingMatches = new Set<number>();
            for (let i = 0; i < totalPairs; i++) {
                if (i !== index && newPairs[i].isMatch) {
                    existingMatches.add(i);
                }
            }

            // 2. Find valid slots for 1 new match that are NOT adjacent to any existing match
            const validNewMatchSlots = [];
            for (let i = 0; i < totalPairs; i++) {
                if (i === index) continue; // The clicked spot must become a mismatch
                if (existingMatches.has(i)) continue;
                if (existingMatches.has(i - 1) || existingMatches.has(i + 1)) continue;
                validNewMatchSlots.push(i);
            }

            let newMatchIdx = -1;
            if (validNewMatchSlots.length > 0) {
                newMatchIdx = validNewMatchSlots[Math.floor(Math.random() * validNewMatchSlots.length)];
            } else {
                // Fallback (extremely unlikely)
                newMatchIdx = (index + 2) % totalPairs;
            }

            // Apply the status changes so we maintain exactly matchCount matches
            newPairs[index] = { ...newPairs[index], isMatch: false };
            newPairs[newMatchIdx] = { ...newPairs[newMatchIdx], isMatch: true };

            // 3. Pick 10 indices to randomly change, MUST include the two we modified
            const changeIndices = new Set<number>();
            changeIndices.add(index);
            changeIndices.add(newMatchIdx);

            const sampleSize = Math.min(10, totalPairs);
            while(changeIndices.size < sampleSize) {
                changeIndices.add(Math.floor(Math.random() * totalPairs));
            }

            // 4. Regenerate characters for those indices based on their current isMatch status
            for (const i of changeIndices) {
                if (newPairs[i].isMatch) {
                    newPairs[i] = { id: i, ...generateMatch() };
                } else {
                    newPairs[i] = { id: i, ...generateMismatch() };
                }
            }

            return newPairs;
        });
    };

    if (pairs.length === 0) return null;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative pb-12">
            
            {/* Header & Progress Bar */}
            <div className="absolute top-0 w-full flex flex-col items-center px-4 max-w-2xl md:-top-6">
                <h2 className="text-xl font-bold font-sans mb-4">Quick Glance</h2>
                <GlanceTimerBar
                    durationMs={timeLimitMs}
                    isActive={!!isActive}
                    onTimeout={onWrong}
                    resetSignal={resetSignal}
                />
            </div>

            {/* Grid */}
            <div className="mt-16 md:mt-24 w-full max-w-6xl px-2 overflow-y-auto hide-scrollbar flex justify-center">
                <div 
                    className="grid gap-1 sm:gap-1.5 md:gap-2 justify-center"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {pairs.map((pair, index) => (
                        <button
                            key={pair.id}
                            onClick={() => handlePairClick(index)}
                            className={`
                                flex flex-col items-center justify-center p-0.5 sm:p-1 md:p-2 rounded 
                                bg-white/60 hover:bg-white active:scale-95 transition-all
                                border border-[#FFB7A3] drop-shadow-sm cursor-pointer
                                w-[34px] h-[46px] sm:w-[54px] sm:h-[66px] md:w-[68px] md:h-[80px]
                            `}
                        >
                            <span className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'} leading-none`}>
                                {pair.kana}
                            </span>
                            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-arbutus text-[#DF7956] mt-0.5 sm:mt-1 leading-none">
                                {pair.romaji}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickGlanceDrill;
