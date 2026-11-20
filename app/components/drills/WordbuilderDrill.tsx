"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CharItem } from '../../types/kana';
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

function getFullWordRomaji(slots: { char: string; romaji: string }[]): string {
    let result = '';
    for (let i = 0; i < slots.length; i++) {
        const current = slots[i];
        if (current.char === 'っ' || current.char === 'ッ') {
            const next = slots[i + 1];
            if (next && next.romaji) {
                result += next.romaji[0];
            } else {
                result += 't';
            }
        } else if (current.char === 'ー') {
            const prev = slots[i - 1];
            if (prev && prev.romaji) {
                result += prev.romaji.slice(-1);
            } else {
                result += '-';
            }
        } else {
            result += current.romaji;
        }
    }
    return result;
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
    const fullRomaji = useMemo(() => {
        if (!currentWord) return '';
        return getFullWordRomaji(currentWord.slots);
    }, [currentWord]);

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
        <>
            {/* Mobile View (6x6 Grid, compact mobile layout) */}
            <div className="flex md:hidden flex-col items-center justify-between w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-2 sm:px-4 select-none pb-8 sm:pb-10">
                {/* Target Word Guessing Section */}
                <div className="flex-1 flex flex-col items-center justify-center pt-2 sm:pt-4 pb-2 sm:pb-4 text-center">
                    {/* Kana Slots Baseline */}
                    <div className="flex items-end justify-center gap-2.5 sm:gap-3 h-16 sm:h-20">
                        {currentWord.slots.map((slot, idx) => {
                            const isFilled = idx < filledSlotCount;
                            const isActiveSlot = idx === filledSlotCount;
                            const isCompound = slot.char.length > 1;

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col items-center justify-end h-full transition-all duration-200 ${
                                        isCompound ? 'w-13 sm:w-15' : 'w-10 sm:w-11'
                                    }`}
                                >
                                    {isFilled ? (
                                        <div className="flex items-center justify-center w-full h-full pb-0.5">
                                            <span className={`text-4xl sm:text-4xl font-bold text-[#5C3A21] animate-popup whitespace-nowrap leading-none ${
                                                isCompound ? 'tracking-tighter' : ''
                                            } ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                                {slot.char}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Active slot cursor: vertical peach gradient box */}
                                            {isActiveSlot && (
                                                <div className="absolute inset-0 rounded-t-sm bg-gradient-to-t from-[#FFB7A3]/90 via-[#FFB7A3]/35 to-transparent animate-pulse" />
                                            )}
                                            {/* Baseline Underline for empty slots */}
                                            <div className={`w-full h-[3px] rounded-full z-10 transition-colors ${
                                                isActiveSlot ? 'bg-[#5C3A21]' : 'bg-[#5C3A21]/40'
                                            }`} />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Full Word Romaji */}
                    <div className="mt-3 sm:mt-4 text-2xl font-arbutus text-[#5C3A21] tracking-wide">
                        {fullRomaji}
                    </div>

                    {/* Meaning */}
                    <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-1.5 text-base font-medium text-[#5C3A21]/75">
                        <span>{currentWord.meaning}</span>
                        {currentWord.kanjiDisplay && currentWord.kanjiDisplay !== currentWord.word && (
                            <span className="text-xs sm:text-sm text-[#5C3A21]/50 font-normal">
                                ({currentWord.kanjiDisplay})
                            </span>
                        )}
                    </div>
                </div>

                {/* 6x6 Grid Tiles on Mobile */}
                <div className="w-full flex justify-center pb-2 mt-2 sm:mt-4 mb-3 sm:mb-4">
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-[340px] sm:max-w-[400px]">
                        {tiles.map((tile) => {
                            const isWrong = wrongTileId === tile.id;
                            const isRefilling = refillingTileIds.has(tile.id);
                            const isCompound = tile.char.length > 1;

                            return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(tile.id)}
                                    disabled={tile.isUsed}
                                    aria-label={`Huruf ${tile.char}`}
                                    className={`flex items-center justify-center w-full aspect-square rounded-xl border transition-all duration-200 cursor-pointer ${
                                        tile.isUsed
                                            ? 'opacity-0 scale-50 pointer-events-none'
                                            : isWrong
                                            ? 'bg-rose-500/20 text-rose-600 border-rose-500 scale-105 shadow-md animate-bounce'
                                            : isRefilling
                                            ? 'bg-[#DF7956]/20 text-[#DF7956] border-[#DF7956] animate-popup'
                                            : 'bg-[#FFF5F0] hover:bg-white text-[#5C3A21] border-[#DF7956]/20 hover:border-[#DF7956]/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    <span className={`font-bold leading-none ${
                                        isCompound
                                            ? 'text-lg tracking-tighter'
                                            : 'text-2xl'
                                    } ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                        {tile.char}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Desktop View (100% exact original reference: centered layout, 9-col grid, original fonts, original gaps & sizing) */}
            <div className="hidden md:flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-2 sm:px-4 select-none pb-10 lg:pb-12">
                {/* Target Word Guessing Section */}
                <div className="flex-initial flex flex-col items-center justify-center pt-2 sm:pt-4 pb-2 sm:pb-4 text-center mb-8 lg:mb-10">
                    {/* Kana Slots Baseline */}
                    <div className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4 h-16 sm:h-20">
                        {currentWord.slots.map((slot, idx) => {
                            const isFilled = idx < filledSlotCount;
                            const isActiveSlot = idx === filledSlotCount;
                            const isCompound = slot.char.length > 1;

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col items-center justify-end h-full transition-all duration-200 ${
                                        isCompound ? 'w-12 sm:w-15 md:w-18' : 'w-9 sm:w-11 md:w-13'
                                    }`}
                                >
                                    {isFilled ? (
                                        <div className="flex items-center justify-center w-full h-full pb-0.5">
                                            <span className={`text-3xl sm:text-4xl md:text-5xl font-bold text-[#5C3A21] animate-popup whitespace-nowrap leading-none ${
                                                isCompound ? 'tracking-tighter' : ''
                                            } ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                                {slot.char}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Active slot cursor: vertical peach gradient box */}
                                            {isActiveSlot && (
                                                <div className="absolute inset-0 rounded-t-sm bg-gradient-to-t from-[#FFB7A3]/90 via-[#FFB7A3]/35 to-transparent animate-pulse" />
                                            )}
                                            {/* Baseline Underline for empty slots */}
                                            <div className={`w-full h-[2.5px] sm:h-[3px] rounded-full z-10 transition-colors ${
                                                isActiveSlot ? 'bg-[#5C3A21]' : 'bg-[#5C3A21]/40'
                                            }`} />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Full Word Romaji */}
                    <div className="mt-3 sm:mt-4 text-xl sm:text-2xl font-arbutus text-[#5C3A21] tracking-wide">
                        {fullRomaji}
                    </div>

                    {/* Meaning */}
                    <div className="mt-1 sm:mt-1.5 flex items-center justify-center gap-1.5 text-sm sm:text-base font-medium text-[#5C3A21]/75">
                        <span>{currentWord.meaning}</span>
                        {currentWord.kanjiDisplay && currentWord.kanjiDisplay !== currentWord.word && (
                            <span className="text-xs text-[#5C3A21]/50 font-normal">
                                ({currentWord.kanjiDisplay})
                            </span>
                        )}
                    </div>
                </div>

                {/* 4x9 Grid Tiles (Directly floating on background, no outer container) */}
                <div className="w-full flex justify-center">
                    <div 
                        className="grid gap-2 sm:gap-2.5 md:gap-3 w-full max-w-3xl sm:max-w-4xl"
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
                                    className={`flex items-center justify-center aspect-square h-12 sm:h-14 md:h-16 lg:h-18 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        tile.isUsed
                                            ? 'opacity-0 scale-50 pointer-events-none'
                                            : isWrong
                                            ? 'bg-rose-500/20 text-rose-600 border-rose-500 scale-105 shadow-md animate-bounce'
                                            : isRefilling
                                            ? 'bg-[#DF7956]/20 text-[#DF7956] border-[#DF7956] animate-popup'
                                            : 'bg-[#FFF5F0] hover:bg-white text-[#5C3A21] border-[#DF7956]/20 hover:border-[#DF7956]/50 shadow-sm hover:shadow-md hover:scale-105 active:scale-95'
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
        </>
    );
};

export default WordbuilderDrill;
