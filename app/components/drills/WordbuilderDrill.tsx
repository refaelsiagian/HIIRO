"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Sparkles } from 'lucide-react';
import {
    generateWordbuilderGame,
    getNextRefillLetter,
    WordbuilderGameState,
    GridTile,
    TargetWord
} from '../../utils/drills/wordbuilderGenerator';

interface WordbuilderDrillProps {
    groupChars: CharItem[];
    targetScore?: number;
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

/**
 * Wordbuilder Drill (Daishiken Quiz 2)
 * - 4x9 Grid (36 tiles on screen).
 * - Empty slots with small romaji on top, meaning under the slots.
 * - No romaji inside grid tiles.
 * - Disappear & Dynamic Refill:
 *   - The first 5 cleared tiles disappear and leave empty spots.
 *   - From tile 6 onwards, when a tile disappears, an empty spot is immediately refilled
 *     from the reserve queue (total letters defined by targetScore / scoreGoal).
 *   - Once the reserve is exhausted, remaining tiles disappear one by one until grid is empty.
 */
const WordbuilderDrill: React.FC<WordbuilderDrillProps> = ({
    groupChars,
    targetScore = 100,
    onCorrect,
    onWrong,
    isSansSerif,
    isActive = true,
}) => {
    // Detect category (hiragana or katakana)
    const category = useMemo<'hiragana' | 'katakana'>(() => {
        if (groupChars && groupChars.length > 0 && (groupChars[0] as any).category) {
            return (groupChars[0] as any).category as 'hiragana' | 'katakana';
        }
        const firstChar = groupChars?.[0]?.k || '';
        return /[\u30A0-\u30FF]/.test(firstChar) ? 'katakana' : 'hiragana';
    }, [groupChars]);

    // Game state
    const [gameState, setGameState] = useState<WordbuilderGameState | null>(null);
    const [tiles, setTiles] = useState<GridTile[]>([]);
    const [reserveQueue, setReserveQueue] = useState<string[]>([]);
    const [clearedCount, setClearedCount] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [filledSlotCount, setFilledSlotCount] = useState(0);
    const [isWordCompleting, setIsWordCompleting] = useState(false);
    const [wrongTileId, setWrongTileId] = useState<number | null>(null);
    const [refillingTileIds, setRefillingTileIds] = useState<Set<number>>(new Set());

    // Initialize game
    useEffect(() => {
        const newGame = generateWordbuilderGame(category, targetScore);
        setGameState(newGame);
        setTiles(newGame.initialTiles);
        setReserveQueue(newGame.reserveQueue);
        setClearedCount(0);
        setCurrentWordIndex(0);
        setFilledSlotCount(0);
        setIsWordCompleting(false);
        setWrongTileId(null);
        setRefillingTileIds(new Set());
    }, [category, targetScore]);

    const currentWord: TargetWord | undefined = gameState?.words[currentWordIndex];
    const totalWords = gameState?.words.length ?? 0;
    const totalLettersGoal = gameState?.totalLetters ?? targetScore;
    const remainingLetters = totalLettersGoal - clearedCount;

    // Handle tile selection
    const handleTileClick = useCallback((tileId: number) => {
        if (!isActive || !currentWord || isWordCompleting) return;

        const tile = tiles[tileId];
        if (!tile || tile.isUsed) return;

        const expectedSlot = currentWord.slots[filledSlotCount];
        if (!expectedSlot) return;

        if (tile.char === expectedSlot.char) {
            // Correct letter clicked!
            const nextCleared = clearedCount + 1;
            setClearedCount(nextCleared);

            // 1. Mark tile as used -> animates out
            setTiles(prev => prev.map(t => t.id === tileId ? { ...t, isUsed: true } : t));

            // 2. Fill the active slot
            const nextFilled = filledSlotCount + 1;
            setFilledSlotCount(nextFilled);

            // 3. Award score in DrillEngine
            onCorrect();

            // 4. Dynamic Refill:
            // "empty tiles start filling again with new tiles after 5 tiles, after that, when a tile disappear, another appears again on the empty spot"
            // "the new tiles appear on other empty tiles, not the one that just disappear"
            if (nextCleared > 5 && reserveQueue.length > 0) {
                // Find all OTHER currently empty spots on the board (excluding tileId that just disappeared)
                const otherEmptySpotIds = tiles
                    .filter(t => t.isUsed && t.id !== tileId)
                    .map(t => t.id);

                // Select target spot from other empty tiles
                const targetSpotId = otherEmptySpotIds.length > 0
                    ? otherEmptySpotIds[Math.floor(Math.random() * otherEmptySpotIds.length)]
                    : tileId;

                const activeChars = tiles
                    .filter(t => !t.isUsed && t.id !== tileId)
                    .map(t => t.char);

                const refillResult = getNextRefillLetter(currentWord, activeChars, reserveQueue);
                if (refillResult) {
                    const { letter, updatedReserve } = refillResult;
                    setReserveQueue(updatedReserve);

                    // Spawn the new tile at targetSpotId (not tileId) with smooth pop-in animation
                    setTimeout(() => {
                        setTiles(prev => prev.map(t => {
                            if (t.id === targetSpotId) {
                                return {
                                    ...t,
                                    char: letter,
                                    isUsed: false
                                };
                            }
                            return t;
                        }));

                        setRefillingTileIds(prev => new Set(prev).add(targetSpotId));
                        setTimeout(() => {
                            setRefillingTileIds(prev => {
                                const next = new Set(prev);
                                next.delete(targetSpotId);
                                return next;
                            });
                        }, 350);
                    }, 240);
                }
            }

            // 5. Check if current word is completed
            if (nextFilled === currentWord.slots.length) {
                setIsWordCompleting(true);
                setTimeout(() => {
                    if (gameState && currentWordIndex + 1 < gameState.words.length) {
                        setCurrentWordIndex(prev => prev + 1);
                        setFilledSlotCount(0);
                        setIsWordCompleting(false);
                    } else {
                        // All words cleared! Board is now empty!
                        setIsWordCompleting(false);
                    }
                }, 500);
            }
        } else {
            // Wrong letter clicked
            setWrongTileId(tileId);
            onWrong();
            setTimeout(() => setWrongTileId(null), 450);
        }
    }, [
        isActive,
        currentWord,
        filledSlotCount,
        isWordCompleting,
        tiles,
        clearedCount,
        reserveQueue,
        onCorrect,
        onWrong,
        gameState,
        currentWordIndex
    ]);

    if (!gameState || !currentWord) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[350px]">
                <div className="w-8 h-8 rounded-full border-2 border-[#DF7956] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-2 sm:px-4 py-1 select-none">
            {/* Top Info Bar */}
            <div className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#5C3A21]/75 mb-1.5 px-2">
                <span className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DF7956]/15 text-[#DF7956] border border-[#DF7956]/30 text-[11px] uppercase tracking-wider font-mono">
                        Kata {currentWordIndex + 1} / {totalWords}
                    </span>
                    {currentWord.category && (
                        <span className="hidden sm:inline-block text-[11px] text-[#5C3A21]/50 capitalize font-medium">
                            • {currentWord.category}
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-1 text-[#DF7956] font-mono text-xs font-bold">
                    <Sparkles size={14} /> Sisa Huruf: {remainingLetters} / {totalLettersGoal}
                </span>
            </div>

            {/* Target Word Card: Empty Slots with Romaji on Top, Meaning Below */}
            <div className={`w-full max-w-md sm:max-w-lg bg-white/85 backdrop-blur-md border-2 rounded-2xl px-4 py-3 sm:py-3.5 shadow-sm text-center transition-all duration-300 ${
                isWordCompleting ? 'border-emerald-500/60 ring-4 ring-emerald-500/20 bg-emerald-50/60' : 'border-[#DF7956]/40'
            }`}>
                {/* Kanji representation if available */}
                {currentWord.kanjiDisplay && currentWord.kanjiDisplay !== currentWord.word && (
                    <div className="text-xs text-[#5C3A21]/60 font-medium mb-1">
                        Kanji: <span className="font-bold text-[#5C3A21]">{currentWord.kanjiDisplay}</span>
                    </div>
                )}

                {/* 1. Empty Slots with Romaji on Top (Slightly bigger romaji) */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 my-1.5">
                    {currentWord.slots.map((slot, idx) => {
                        const isFilled = idx < filledSlotCount;
                        const isActiveSlot = idx === filledSlotCount;

                        return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                {/* Romaji hint on top */}
                                <span className={`text-sm sm:text-base font-mono font-bold tracking-wider transition-all ${
                                    isFilled ? 'text-emerald-600' : isActiveSlot ? 'text-[#DF7956] scale-105' : 'text-[#DF7956]/70'
                                }`}>
                                    {slot.romaji}
                                </span>

                                {/* The slot box */}
                                <div
                                    className={`w-12 h-14 sm:w-14 sm:h-16 md:w-15 md:h-17 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl transition-all duration-200 ${
                                        isFilled
                                            ? 'bg-gradient-to-br from-[#DF7956] to-[#C86443] text-white border-2 border-[#DF7956] shadow-sm scale-100'
                                            : isActiveSlot
                                            ? 'bg-white border-2 border-[#DF7956] ring-4 ring-[#DF7956]/20 text-[#DF7956]/30 shadow-inner'
                                            : 'bg-white/40 border-2 border-dashed border-[#DF7956]/40 text-[#5C3A21]/20'
                                    }`}
                                >
                                    {isFilled ? (
                                        <span className={`animate-popup ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                            {slot.char}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-mono text-[#5C3A21]/30">·</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. Under the slots: Meaning (Smaller font) */}
                <div className="text-center mt-1.5">
                    <div className="text-sm sm:text-base font-semibold text-[#5C3A21]/80">
                        {currentWord.meaning}
                    </div>
                    {currentWord.origin && (
                        <div className="text-[11px] text-[#5C3A21]/60 font-medium mt-0.5">
                            Kata Asal: <span className="font-semibold text-[#DF7956]">{currentWord.origin}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. The 4x9 Grid (36 Tiles, Dynamic Refill, Extra Large & Comfortable) */}
            <div className="w-full mt-3 flex flex-col items-center">
                <div className="w-full max-w-3xl sm:max-w-4xl p-2.5 sm:p-4 bg-[#5C3A21]/5 rounded-2xl border border-[#DF7956]/20 shadow-inner">
                    <div 
                        className="grid gap-2 sm:gap-2.5 md:gap-3"
                        style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}
                    >
                        {tiles.map((tile) => {
                            const isWrong = wrongTileId === tile.id;
                            const isRefilling = refillingTileIds.has(tile.id);

                            return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(tile.id)}
                                    disabled={tile.isUsed}
                                    aria-label={`Huruf ${tile.char}`}
                                    className={`flex items-center justify-center aspect-square h-13 sm:h-15 md:h-17 lg:h-19 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                                        tile.isUsed
                                            ? 'opacity-0 scale-50 pointer-events-none'
                                            : isWrong
                                            ? 'bg-rose-500/20 text-rose-600 border-rose-500 scale-105 shadow-md animate-bounce'
                                            : isRefilling
                                            ? 'bg-[#DF7956]/20 text-[#DF7956] border-[#DF7956] animate-popup'
                                            : 'bg-white/95 hover:bg-white text-[#5C3A21] border-[#DF7956]/30 hover:border-[#DF7956] shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    <span className={`text-xl sm:text-2xl md:text-3xl font-bold leading-none ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                        {tile.char}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordbuilderDrill;
