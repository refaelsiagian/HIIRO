"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CharItem } from '../../types/kana';
import { Check, Sparkles } from 'lucide-react';

interface FlipItDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
    pairsPerWave?: number;
    waveCount?: number;
    totalCards?: number;
}

type CardData = {
    id: string;
    pairId: string;
    type: 'kana' | 'romaji';
    text: string;
    isFlipped: boolean;
    isMatched: boolean;
};

/**
 * Builds wave character lists.
 * - For Shotesto (typically 15 chars, 8 pairs per wave):
 *   Wave 1 takes 8 unique characters.
 *   Wave 2 takes the remaining 7 unselected characters + 1 recycled from Wave 1.
 * - For Shiken (24 tiles per wave = 12 pairs):
 *   Wave 1 takes 12 unique characters.
 *   Wave 2 takes 12 unique characters (or recycles if fewer available).
 */
function buildWaves(groupChars: CharItem[], pairsPerWave: number, waveCount: number): CharItem[][] {
    const unique = [...groupChars].filter((v, i, a) => a.findIndex(t => t.k === v.k) === i);
    const shuffled = [...unique].sort(() => 0.5 - Math.random());
    
    const waves: CharItem[][] = [];
    
    // Wave 1
    let wave1: CharItem[] = [];
    if (shuffled.length >= pairsPerWave) {
        wave1 = shuffled.slice(0, pairsPerWave);
    } else {
        wave1 = [...shuffled];
        while (wave1.length < pairsPerWave && shuffled.length > 0) {
            const randomPick = shuffled[Math.floor(Math.random() * shuffled.length)];
            wave1.push(randomPick);
        }
    }
    waves.push(wave1);
    
    if (waveCount <= 1) return waves;
    
    // Wave 2
    const remaining = shuffled.slice(pairsPerWave, pairsPerWave * 2);
    let wave2: CharItem[] = [...remaining];
    
    if (wave2.length < pairsPerWave) {
        const needed = pairsPerWave - wave2.length;
        // Take unique characters from wave1 to supplement wave 2
        const wave1Shuffled = [...wave1].sort(() => 0.5 - Math.random());
        for (let i = 0; i < needed; i++) {
            wave2.push(wave1Shuffled[i % wave1Shuffled.length]);
        }
    }
    waves.push(wave2);
    
    // Wave 3+ (if ever configured)
    for (let w = 2; w < waveCount; w++) {
        const nextPool = [...shuffled].sort(() => 0.5 - Math.random()).slice(0, pairsPerWave);
        waves.push(nextPool);
    }
    
    return waves;
}

function createCardsForWave(chars: CharItem[], waveIndex: number): CardData[] {
    const cards: CardData[] = [];
    chars.forEach((char, idx) => {
        // Use romaji as pairId so homophones like ぢ & じ ('ji') or づ & ず ('zu')
        // can match any valid corresponding romaji card on the board
        const pairId = char.r.toLowerCase();
        cards.push({
            id: `w${waveIndex}-kana-${char.k}-${idx}`,
            pairId,
            type: 'kana',
            text: char.k,
            isFlipped: false,
            isMatched: false,
        });
        cards.push({
            id: `w${waveIndex}-romaji-${char.r}-${idx}`,
            pairId,
            type: 'romaji',
            text: char.r,
            isFlipped: false,
            isMatched: false,
        });
    });
    return cards.sort(() => 0.5 - Math.random());
}

const FlipItDrill: React.FC<FlipItDrillProps> = ({ 
    groupChars, 
    onCorrect, 
    onWrong, 
    isSansSerif, 
    isActive,
    pairsPerWave: propPairsPerWave,
    waveCount: propWaveCount = 2,
    totalCards,
}) => {
    // Resolve pairsPerWave: prop > totalCards/2 > default 8 (16 tiles)
    const pairsPerWave = propPairsPerWave ?? (totalCards ? Math.floor(totalCards / 2) : 8);
    const waveCount = propWaveCount ?? 2;

    const waves = useMemo(() => {
        return buildWaves(groupChars, pairsPerWave, waveCount);
    }, [groupChars, pairsPerWave, waveCount]);

    const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
    const [cards, setCards] = useState<CardData[]>(() => {
        if (waves.length > 0) {
            return createCardsForWave(waves[0], 0);
        }
        return [];
    });
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isWaveEntering, setIsWaveEntering] = useState(false);

    // Sync if waves change (e.g. stage restarts or changes)
    const prevWavesRef = React.useRef(waves);
    useEffect(() => {
        if (prevWavesRef.current !== waves && waves.length > 0) {
            prevWavesRef.current = waves;
            setCurrentWaveIndex(0);
            setCards(createCardsForWave(waves[0], 0));
            setFlippedIndices([]);
            setIsTransitioning(false);
            setIsWaveEntering(false);
        }
    }, [waves]);

    const handleCardClick = (index: number) => {
        if (!isActive || isTransitioning) return;
        if (cards[index].isMatched || cards[index].isFlipped) return;

        setFlippedIndices(prev => {
            if (prev.length === 2) {
                // If 2 are already flipped, flip them back and flip the new one
                const newCards = [...cards];
                newCards[prev[0]].isFlipped = false;
                newCards[prev[1]].isFlipped = false;
                newCards[index].isFlipped = true;
                setCards(newCards);
                return [index];
            } else {
                // Flip the new card
                const newCards = [...cards];
                newCards[index].isFlipped = true;
                setCards(newCards);
                return [...prev, index];
            }
        });
    };

    const handleMatchClick = () => {
        if (!isActive || flippedIndices.length !== 2 || isTransitioning) return;

        const card1 = cards[flippedIndices[0]];
        const card2 = cards[flippedIndices[1]];

        const isMatch = card1.pairId === card2.pairId && card1.type !== card2.type;

        if (isMatch) {
            onCorrect();
            const newCards = [...cards];
            newCards[flippedIndices[0]].isMatched = true;
            newCards[flippedIndices[1]].isMatched = true;
            setCards(newCards);
            setFlippedIndices([]);

            // Check if all cards in this wave are matched
            const allMatched = newCards.every(c => c.isMatched);
            if (allMatched) {
                if (currentWaveIndex + 1 < waves.length) {
                    setIsTransitioning(true);
                    
                    // The last two cards fade out with transition-opacity 300ms.
                    // Immediately after they disappear (at 300ms), start the next wave with domino ripple!
                    setTimeout(() => {
                        const nextWaveIdx = currentWaveIndex + 1;
                        setCurrentWaveIndex(nextWaveIdx);
                        setCards(createCardsForWave(waves[nextWaveIdx], nextWaveIdx));
                        setFlippedIndices([]);
                        setIsWaveEntering(true);

                        const cols = pairsPerWave > 8 ? 6 : 4;
                        const maxDiagonal = (cols - 1) + 3; // 4x4 -> 6, 6x4 -> 8
                        const cascadeDuration = (maxDiagonal * 45) + 380;

                        setTimeout(() => {
                            setIsTransitioning(false);
                            setIsWaveEntering(false);
                        }, cascadeDuration);
                    }, 300);
                }
            }
        } else {
            onWrong();
            const newCards = [...cards];
            newCards[flippedIndices[0]].isFlipped = false;
            newCards[flippedIndices[1]].isFlipped = false;
            setCards(newCards);
            setFlippedIndices([]);
        }
    };

    if (cards.length === 0 && waves.length === 0) return null;

    const isLargeGrid = pairsPerWave > 8; // e.g. 12 pairs = 24 cards

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative">
            {/* Header with Wave Indicator */}
            <div className="absolute top-0 md:-top-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold font-sans">Flip and Match</h2>
                {waves.length > 1 && (
                    <span className={`text-xs font-semibold px-3 py-0.5 rounded-full mt-1 transition-all duration-300 ${
                        isWaveEntering ? 'bg-[#DF7956] text-white scale-110 shadow-sm' : 'bg-[#DF7956]/20 text-[#5C3A21]'
                    }`}>
                        Gelombang {currentWaveIndex + 1} dari {waves.length}
                    </span>
                )}
            </div>

            {/* Grid */}
            <div className="mt-8 md:mt-10 px-4">
                <div className={`
                    grid gap-2 sm:gap-3 md:gap-3.5
                    ${isLargeGrid ? 'grid-cols-6 max-w-4xl' : 'grid-cols-4 max-w-xl'}
                `}>
                    {cards.map((card, index) => {
                        const isVisible = card.isFlipped || card.isMatched;
                        const cols = isLargeGrid ? 6 : 4;
                        const row = Math.floor(index / cols);
                        const col = index % cols;
                        const diagonal = row + col;
                        const staggerDelay = diagonal * 45;

                        return (
                            <button
                                key={`${card.id}-${currentWaveIndex}`}
                                onClick={() => handleCardClick(index)}
                                disabled={card.isMatched || card.isFlipped || isTransitioning}
                                className={`
                                    relative w-14 h-16 sm:w-18 sm:h-20 md:w-20 md:h-24 rounded-lg transition-all duration-300 transform-gpu
                                    ${card.isMatched ? 'opacity-0 pointer-events-none' : 'cursor-pointer drop-shadow-sm'}
                                    ${!isVisible && !isTransitioning && 'hover:-translate-y-1'}
                                    ${isWaveEntering ? 'animate-domino' : ''}
                                `}
                                style={{ 
                                    perspective: '1000px',
                                    animationDelay: isWaveEntering ? `${staggerDelay}ms` : undefined,
                                }}
                            >
                                {/* Front (Hidden State) */}
                                <div 
                                    className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#FFB7A3] to-[#E89A81] rounded-lg border-b-4 border-[#C15A3D] flex items-center justify-center transition-all duration-300
                                    ${isVisible ? '[transform:rotateY(180deg)] opacity-0' : '[transform:rotateY(0deg)] opacity-100'}`}
                                >
                                    <div className="w-4 h-4 rounded-full bg-white/30"></div>
                                </div>

                                {/* Back (Revealed State) */}
                                <div 
                                    className={`absolute inset-0 w-full h-full bg-white rounded-lg border-2 border-[#DF7956] flex items-center justify-center transition-all duration-300
                                    ${isVisible ? '[transform:rotateY(0deg)] opacity-100' : '[transform:rotateY(-180deg)] opacity-0'}`}
                                >
                                    <span 
                                        className={`
                                            ${card.type === 'kana' 
                                                ? 'text-2xl sm:text-3xl md:text-4xl' 
                                                : 'text-lg sm:text-xl font-arbutus'} 
                                            text-[#5C3A21]
                                            ${card.type === 'kana' && !isSansSerif ? 'font-serif' : 'font-sans'}
                                        `}
                                    >
                                        {card.text}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Match Button */}
            <div className="mt-5 md:mt-6 flex justify-center w-full">
                <button
                    onClick={handleMatchClick}
                    disabled={flippedIndices.length !== 2 || isTransitioning}
                    className={`
                        flex items-center space-x-2 px-7 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-lg sm:text-xl transition-all duration-300
                        ${flippedIndices.length === 2 && !isTransitioning
                            ? 'bg-[#DF7956] text-white hover:scale-105 active:scale-95 drop-shadow-lg cursor-pointer' 
                            : 'bg-[#DF7956]/50 text-white/70 cursor-not-allowed scale-95'}
                    `}
                >
                    <Check strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>MATCH</span>
                </button>
            </div>
        </div>
    );
};

export default FlipItDrill;
