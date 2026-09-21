"use client";

import React, { useState, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Check, X } from 'lucide-react';

interface TrueFalseProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    onToggleSansSerif?: () => void;
}

const TrueFalseDrill: React.FC<TrueFalseProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, onToggleSansSerif }) => {
    const generateQuestion = useCallback((prevKana?: string, prevRomaji?: string) => {
        if (!groupChars || groupChars.length === 0) return { kana: '?', romaji: '?', isTrue: true };
        
        let possibleItems = groupChars;
        if (groupChars.length > 1 && prevKana) {
            possibleItems = groupChars.filter(c => c.k !== prevKana);
        }

        const correctItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        
        // 50% chance to be true
        const isTrue = Math.random() > 0.5;
        let shownRomaji = correctItem.r;

        if (!isTrue) {
            // Pick a different romaji from the group
            let otherItems = groupChars.filter(c => c.r !== correctItem.r);
            // Also avoid prevRomaji if possible
            if (otherItems.length > 1 && prevRomaji) {
                const filtered = otherItems.filter(c => c.r !== prevRomaji);
                if (filtered.length > 0) {
                    otherItems = filtered;
                }
            }
            if (otherItems.length === 0) otherItems = groupChars; // Fallback if only 1 char
            shownRomaji = otherItems[Math.floor(Math.random() * otherItems.length)].r;
        }

        return { kana: correctItem.k, romaji: shownRomaji, isTrue };
    }, [groupChars]);

    const [question, setQuestion] = useState(generateQuestion());

    const handleAnswer = (answer: boolean) => {
        if (answer === question.isTrue) {
            onCorrect();
            setQuestion(generateQuestion(question.kana, question.romaji));
        } else {
            onWrong();
            // Don't change question on wrong, let them try again or engine handles game over
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full max-w-lg mx-auto py-12">
            <div className="flex-1 flex flex-col items-center justify-center">
                <span className={`text-[180px] leading-none text-[#5C3A21] mb-8 ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                    {question.kana}
                </span>
                <span className="text-4xl text-[#5C3A21] font-arbutus tracking-wider">
                    {question.romaji}
                </span>
            </div>

            <div className="flex w-full justify-center space-x-24 mt-8">
                <button
                    onClick={() => handleAnswer(true)}
                    className="text-green-600 hover:text-green-500 hover:scale-120 font-outfit font-black text-[80px] transition-all active:scale-95 leading-none w-48 h-48 flex items-center justify-center rounded-3xl"
                >
                    O
                </button>
                <button
                    onClick={() => handleAnswer(false)}
                    className="text-red-600 hover:text-red-500 hover:scale-120 font-outfit font-black text-[80px] transition-all active:scale-95 leading-none w-48 h-48 flex items-center justify-center rounded-3xl"
                >
                    X
                </button>
            </div>

            {onToggleSansSerif && (
                <button 
                    onClick={onToggleSansSerif}
                    className="flex items-center text-[#5C3A21] opacity-60 hover:opacity-100 transition-opacity font-outfit text-md"
                >
                    <div className="w-4 h-4 rounded-full border border-[#5C3A21] mr-2 flex items-center justify-center">
                        {isSansSerif && <div className="w-2 h-2 rounded-full bg-[#5C3A21]" />}
                    </div>
                    Ganti ke sans-serif
                </button>
            )}
        </div>
    );
};

export default TrueFalseDrill;
