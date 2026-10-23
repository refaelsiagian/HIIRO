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
    const [cards, setCards] = useState<CardData[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (isActive && waves.length > 0) {
            setCurrentWaveIndex(0);
            setCards(createCardsForWave(waves[0], 0));
            setFlippedIndices([]);
            setIsTransitioning(false);
        }
    }, [isActive, waves]);

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
                    setTimeout(() => {
                        const nextWaveIdx = currentWaveIndex + 1;
                        setCurrentWaveIndex(nextWaveIdx);
                        setCards(createCardsForWave(waves[nextWaveIdx], nextWaveIdx));
                        setFlippedIndices([]);
                        setIsTransitioning(false);
                    }, 800);
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

    if (cards.length === 0) return <div>Loading...</div>;

    const isLargeGrid = pairsPerWave > 8; // e.g. 12 pairs = 24 cards

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative pb-24">
            {/* Header with Wave Indicator */}
            <div className="absolute top-0 md:-top-8 w-full flex flex-col items-center">
                <h2 className="text-xl font-bold font-sans">Flip and Match</h2>
                {waves.length > 1 && (
                    <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-[#DF7956]/20 text-[#5C3A21] mt-1">
                        Gelombang {currentWaveIndex + 1} dari {waves.length}
                    </span>
                )}
            </div>

            {/* Wave Transition Banner */}
            {isTransitioning && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px] rounded-2xl animate-fade-in pointer-events-none">
                    <div className="bg-white/95 px-6 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-[#5C3A21]">
                        <Sparkles className="w-5 h-5 text-[#DF7956] animate-spin" />
                        <span className="font-bold">Gelombang {currentWaveIndex + 1} Selesai!</span>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="mt-12 md:mt-14 px-4">
                <div className={`
                    grid gap-2.5 md:gap-4
                    ${isLargeGrid ? 'grid-cols-6 max-w-4xl' : 'grid-cols-4 max-w-xl'}
                `}>
                    {cards.map((card, index) => {
                        const isVisible = card.isFlipped || card.isMatched;

                        return (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(index)}
                                disabled={card.isMatched || card.isFlipped || isTransitioning}
                                className={`
                                    relative w-14 h-18 sm:w-20 sm:h-24 md:w-24 md:h-28 rounded-lg transition-all duration-300 transform-gpu
                                    ${card.isMatched ? 'opacity-0 pointer-events-none' : 'cursor-pointer drop-shadow-sm'}
                                    ${!isVisible && !isTransitioning && 'hover:-translate-y-1'}
                                `}
                                style={{ perspective: '1000px' }}
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
                                                ? 'text-3xl sm:text-4xl md:text-5xl' 
                                                : 'text-xl sm:text-2xl font-arbutus'} 
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
            <div className="absolute bottom-6 md:bottom-10 flex justify-center w-full">
                <button
                    onClick={handleMatchClick}
                    disabled={flippedIndices.length !== 2 || isTransitioning}
                    className={`
                        flex items-center space-x-2 px-8 py-3.5 rounded-full font-bold text-xl transition-all duration-300
                        ${flippedIndices.length === 2 && !isTransitioning
                            ? 'bg-[#DF7956] text-white hover:scale-105 active:scale-95 drop-shadow-lg cursor-pointer' 
                            : 'bg-[#DF7956]/50 text-white/70 cursor-not-allowed scale-95'}
                    `}
                >
                    <Check strokeWidth={3} />
                    <span>MATCH</span>
                </button>
            </div>
        </div>
    );
};

export default FlipItDrill;
