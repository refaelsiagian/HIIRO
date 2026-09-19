"use client";

import React, { useState, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Check, X } from 'lucide-react';

interface TrueFalseProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
}

const TrueFalseDrill: React.FC<TrueFalseProps> = ({ groupChars, onCorrect, onWrong }) => {
    const generateQuestion = useCallback(() => {
        if (!groupChars || groupChars.length === 0) return { kana: '?', romaji: '?', isTrue: true };
        
        // 50% chance to be true
        const isTrue = Math.random() > 0.5;
        
        const correctItem = groupChars[Math.floor(Math.random() * groupChars.length)];
        let shownRomaji = correctItem.r;

        if (!isTrue) {
            // Pick a different romaji from the group
            let otherItems = groupChars.filter(c => c.r !== correctItem.r);
            if (otherItems.length === 0) otherItems = groupChars; // Fallback if only 1 char
            shownRomaji = otherItems[Math.floor(Math.random() * otherItems.length)].r;
        }

        return { kana: correctItem.k, romaji: shownRomaji, isTrue };
    }, [groupChars]);

    const [question, setQuestion] = useState(generateQuestion());

    const handleAnswer = (answer: boolean) => {
        if (answer === question.isTrue) {
            onCorrect();
            setQuestion(generateQuestion());
        } else {
            onWrong();
            // Don't change question on wrong, let them try again or engine handles game over
        }
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-center border border-slate-100 flex flex-col items-center w-full max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-12 text-[#5C3A21]">Apakah pasangan ini benar?</h2>
            
            <div className="flex flex-col items-center justify-center mb-16">
                <span className="text-[8rem] leading-none text-[#5C3A21] font-serif mb-4">{question.kana}</span>
                <span className="text-5xl font-black text-[#D97D61] uppercase tracking-widest">{question.romaji}</span>
            </div>

            <div className="flex w-full space-x-6">
                <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border-4 border-red-200 py-6 rounded-2xl font-black text-2xl uppercase transition-all flex items-center justify-center shadow-sm active:scale-95"
                >
                    <X className="w-8 h-8 mr-2" strokeWidth={4} /> Salah
                </button>
                <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-600 border-4 border-green-200 py-6 rounded-2xl font-black text-2xl uppercase transition-all flex items-center justify-center shadow-sm active:scale-95"
                >
                    <Check className="w-8 h-8 mr-2" strokeWidth={4} /> Benar
                </button>
            </div>
        </div>
    );
};

export default TrueFalseDrill;
