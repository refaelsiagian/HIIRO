"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Check } from 'lucide-react';

interface FlipItDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

type CardData = {
    id: string;
    pairId: string;
    type: 'kana' | 'romaji';
    text: string;
    isFlipped: boolean;
    isMatched: boolean;
};

const FlipItDrill: React.FC<FlipItDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    
    const initializeCards = useCallback(() => {
        let uniqueChars = [...groupChars].filter((v, i, a) => a.findIndex(t => (t.r === v.r)) === i);
        
        let initialCards: CardData[] = [];
        uniqueChars.forEach((char, idx) => {
            initialCards.push({
                id: `kana-${idx}`,
                pairId: char.r,
                type: 'kana',
                text: char.k,
                isFlipped: false,
                isMatched: false
            });
            initialCards.push({
                id: `romaji-${idx}`,
                pairId: char.r,
                type: 'romaji',
                text: char.r,
                isFlipped: false,
                isMatched: false
            });
        });

        // Shuffle cards
        initialCards = initialCards.sort(() => 0.5 - Math.random());
        return initialCards;
    }, [groupChars]);

    const [cards, setCards] = useState<CardData[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

    useEffect(() => {
        if (isActive && cards.length === 0) {
            setCards(initializeCards());
        }
    }, [isActive, cards.length, initializeCards]);

    const handleCardClick = (index: number) => {
        if (!isActive) return;
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
        if (!isActive || flippedIndices.length !== 2) return;

        const card1 = cards[flippedIndices[0]];
        const card2 = cards[flippedIndices[1]];

        const isMatch = card1.pairId === card2.pairId && card1.type !== card2.type;

        if (isMatch) {
            onCorrect();
            setCards(prev => {
                const newCards = [...prev];
                newCards[flippedIndices[0]].isMatched = true;
                newCards[flippedIndices[1]].isMatched = true;
                return newCards;
            });
            setFlippedIndices([]);
        } else {
            onWrong();
            setCards(prev => {
                const newCards = [...prev];
                newCards[flippedIndices[0]].isFlipped = false;
                newCards[flippedIndices[1]].isFlipped = false;
                return newCards;
            });
            setFlippedIndices([]);
        }
    };

    if (cards.length === 0) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative pb-24">
            {/* Header */}
            <div className="absolute top-0 md:-top-8 w-full flex justify-center">
                <h2 className="text-xl font-bold font-sans">Flip and Match</h2>
            </div>

            {/* Grid */}
            <div className="mt-12 md:mt-16 px-4">
                <div className="grid grid-cols-5 md:grid-cols-6 gap-2 md:gap-4 max-w-4xl">
                    {cards.map((card, index) => {
                        const isVisible = card.isFlipped || card.isMatched;

                        return (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(index)}
                                disabled={card.isMatched || card.isFlipped}
                                className={`
                                    relative w-12 h-16 md:w-20 md:h-24 rounded-lg transition-all duration-300 transform-gpu
                                    ${card.isMatched ? 'opacity-0 pointer-events-none' : 'cursor-pointer drop-shadow-sm'}
                                    ${!isVisible && 'hover:-translate-y-1'}
                                `}
                                style={{ perspective: '1000px' }}
                            >
                                {/* Front (Hidden State) */}
                                <div 
                                    className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#FFB7A3] to-[#E89A81] rounded-lg border-b-4 border-[#C15A3D] flex items-center justify-center transition-all duration-300
                                    ${isVisible ? '[transform:rotateY(180deg)] opacity-0' : '[transform:rotateY(0deg)] opacity-100'}`}
                                >
                                    {/* Small icon or pattern for card back */}
                                    <div className="w-4 h-4 rounded-full bg-white/30"></div>
                                </div>

                                {/* Back (Revealed State) */}
                                <div 
                                    className={`absolute inset-0 w-full h-full bg-white rounded-lg border-2 border-[#DF7956] flex items-center justify-center transition-all duration-300
                                    ${isVisible ? '[transform:rotateY(0deg)] opacity-100' : '[transform:rotateY(-180deg)] opacity-0'}`}
                                >
                                    <span 
                                        className={`
                                            ${card.type === 'kana' ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl font-arbutus'} 
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
            <div className="absolute bottom-6 md:bottom-12 flex justify-center w-full">
                <button
                    onClick={handleMatchClick}
                    disabled={flippedIndices.length !== 2}
                    className={`
                        flex items-center space-x-2 px-8 py-4 rounded-full font-bold text-xl transition-all duration-300
                        ${flippedIndices.length === 2 
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
