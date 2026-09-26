"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CharItem } from '../../types/kana';

interface QuickGlanceDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

type PairData = {
    id: number;
    kana: string;
    romaji: string;
    isMatch: boolean;
};

const TOTAL_PAIRS = 60;
const MATCH_COUNT = 6;
const TIME_LIMIT_MS = 10000;

const QuickGlanceDrill: React.FC<QuickGlanceDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    
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
        
        while(matchIndices.size < MATCH_COUNT && attempts < 1000) {
            attempts++;
            const idx = Math.floor(Math.random() * TOTAL_PAIRS);
            // Enforce no adjacent matches
            if (!matchIndices.has(idx) && !matchIndices.has(idx - 1) && !matchIndices.has(idx + 1)) {
                matchIndices.add(idx);
            }
        }
        // Fallback in case of extremely bad RNG
        while (matchIndices.size < MATCH_COUNT) {
            const idx = Math.floor(Math.random() * TOTAL_PAIRS);
            matchIndices.add(idx);
        }

        for (let i = 0; i < TOTAL_PAIRS; i++) {
            if (matchIndices.has(i)) {
                initialPairs.push({ id: i, ...generateMatch() });
            } else {
                initialPairs.push({ id: i, ...generateMismatch() });
            }
        }
        return initialPairs;
    }, [generateMatch, generateMismatch]);

    const [pairs, setPairs] = useState<PairData[]>([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
    
    // Timer ref
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTickRef = useRef<number>(Date.now());
    const timeLeftRef = useRef<number>(TIME_LIMIT_MS);

    useEffect(() => {
        if (isActive && pairs.length === 0) {
            setPairs(initializeBoard());
            setTimeLeft(TIME_LIMIT_MS);
            timeLeftRef.current = TIME_LIMIT_MS;
            lastTickRef.current = Date.now();
        }
    }, [isActive, pairs.length, initializeBoard]);

    useEffect(() => {
        if (!isActive || pairs.length === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        lastTickRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTickRef.current;
            lastTickRef.current = now;

            timeLeftRef.current -= delta;

            if (timeLeftRef.current <= 0) {
                // Time out!
                onWrong();
                // Reset timer
                timeLeftRef.current = TIME_LIMIT_MS;
                lastTickRef.current = Date.now();
            }

            setTimeLeft(timeLeftRef.current);
        }, 50); // High frequency for smooth bar

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, pairs.length, onWrong]);

    const handlePairClick = (index: number) => {
        if (!isActive) return;

        const clickedPair = pairs[index];
        if (!clickedPair.isMatch) {
            // Clicked a mismatch!
            onWrong();
            setTimeLeft(TIME_LIMIT_MS);
            timeLeftRef.current = TIME_LIMIT_MS;
            lastTickRef.current = Date.now();
            return;
        }

        // Correct!
        onCorrect();
        setTimeLeft(TIME_LIMIT_MS);
        timeLeftRef.current = TIME_LIMIT_MS;
        lastTickRef.current = Date.now();

        setPairs(prev => {
            const newPairs = [...prev];
            
            // 1. Find all existing matches EXCEPT the one we just clicked
            const existingMatches = new Set<number>();
            for (let i = 0; i < TOTAL_PAIRS; i++) {
                if (i !== index && newPairs[i].isMatch) {
                    existingMatches.add(i);
                }
            }

            // 2. Find valid slots for 1 new match that are NOT adjacent to any existing match
            const validNewMatchSlots = [];
            for (let i = 0; i < TOTAL_PAIRS; i++) {
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
                newMatchIdx = (index + 2) % TOTAL_PAIRS;
            }

            // Apply the status changes so we maintain exactly MATCH_COUNT matches
            newPairs[index] = { ...newPairs[index], isMatch: false };
            newPairs[newMatchIdx] = { ...newPairs[newMatchIdx], isMatch: true };

            // 3. Pick 10 indices to randomly change, MUST include the two we modified
            const changeIndices = new Set<number>();
            changeIndices.add(index);
            changeIndices.add(newMatchIdx);

            while(changeIndices.size < 10) {
                changeIndices.add(Math.floor(Math.random() * TOTAL_PAIRS));
            }

            // 4. Regenerate characters for those 10 indices based on their current isMatch status
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

    if (pairs.length === 0) return <div>Loading...</div>;

    // Calculate percentage for progress bar (grows to full red)
    const progressPercent = ((TIME_LIMIT_MS - Math.max(0, timeLeft)) / TIME_LIMIT_MS) * 100;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative pb-12">
            
            {/* Header & Progress Bar */}
            <div className="absolute top-0 w-full flex flex-col items-center px-4 max-w-2xl md:-top-6">
                <h2 className="text-xl font-bold font-sans mb-4">Quick Glance</h2>
                <div className="w-full h-4 bg-white/40 rounded-full overflow-hidden border border-[#DF7956]/30">
                    <div 
                        className="h-full bg-red-500 transition-all duration-75 ease-linear"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Grid 4x15 = 60 items */}
            {/* We can use grid-cols-5 md:grid-cols-10 or 15 */}
            {/* Let's use 5 columns on mobile (12 rows), and 10 on desktop (6 rows) */}
            <div className="mt-16 md:mt-24 w-full max-w-6xl px-2 overflow-y-auto hide-scrollbar flex justify-center">
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-1.5 md:gap-2">
                    {pairs.map((pair, index) => (
                        <button
                            key={pair.id}
                            onClick={() => handlePairClick(index)}
                            className={`
                                flex flex-col items-center justify-center p-1 md:p-2 rounded 
                                bg-white/60 hover:bg-white active:scale-95 transition-all
                                border border-[#FFB7A3] drop-shadow-sm cursor-pointer
                                w-[52px] h-[64px] sm:w-[60px] sm:h-[72px] md:w-[68px] md:h-[80px]
                            `}
                        >
                            <span className={`text-2xl sm:text-3xl md:text-4xl text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'} leading-none`}>
                                {pair.kana}
                            </span>
                            <span className="text-sm sm:text-base md:text-lg font-arbutus text-[#DF7956] mt-1 leading-none">
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
