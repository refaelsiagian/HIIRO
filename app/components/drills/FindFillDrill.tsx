"use client";

import React, { useState, useCallback } from 'react';
import { CharItem } from '../../types/kana';

interface FindFillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
}

const FindFillDrill: React.FC<FindFillProps> = ({ groupChars, onCorrect, onWrong }) => {
    const generateQuestion = useCallback(() => {
        if (!groupChars || groupChars.length === 0) return { sequence: [], missingIndex: 0, options: [] };

        // Take a slice of up to 5 chars from the group (usually a group is 5 chars)
        const sequence = groupChars.slice(0, 5);
        
        // Pick one to be missing
        const missingIndex = Math.floor(Math.random() * sequence.length);
        const correctChar = sequence[missingIndex];

        // Generate options: correct char + 2 random incorrect chars from the same group
        let pool = [...groupChars].filter(c => c.k !== correctChar.k);
        // If pool is too small (e.g. group has only 2 chars), just duplicate to fill options
        while (pool.length < 2) {
            pool = [...pool, ...groupChars];
        }
        
        const shuffledPool = pool.sort(() => 0.5 - Math.random());
        const options = [correctChar, shuffledPool[0], shuffledPool[1]].sort(() => 0.5 - Math.random());

        return { sequence, missingIndex, options };
    }, [groupChars]);

    const [question, setQuestion] = useState(generateQuestion());
    const [selectedKana, setSelectedKana] = useState<string | null>(null);

    const handleAnswer = (kana: string) => {
        setSelectedKana(kana);
        
        setTimeout(() => {
            if (kana === question.sequence[question.missingIndex].k) {
                onCorrect();
                setQuestion(generateQuestion());
                setSelectedKana(null);
            } else {
                onWrong();
                setSelectedKana(null);
            }
        }, 500); // Small delay to show selection
    };

    if (question.sequence.length === 0) return <div>No data</div>;

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-center border border-slate-100 flex flex-col items-center w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-12 text-[#5C3A21]">Temukan huruf yang hilang!</h2>
            
            <div className="flex justify-center space-x-2 md:space-x-4 mb-16">
                {question.sequence.map((item, idx) => {
                    const isMissing = idx === question.missingIndex;
                    
                    let content = item.k;
                    let style = "bg-slate-50 border-slate-200 text-slate-800";
                    
                    if (isMissing) {
                        if (selectedKana) {
                            content = selectedKana;
                            style = selectedKana === item.k 
                                ? "bg-green-100 border-green-400 text-green-700" 
                                : "bg-red-100 border-red-400 text-red-700";
                        } else {
                            content = "?";
                            style = "bg-[#FDF0EB] border-[#ECA68D] text-[#D97D61] border-dashed";
                        }
                    }

                    return (
                        <div key={idx} className={`w-16 h-20 md:w-24 md:h-28 flex items-center justify-center rounded-2xl border-4 transition-all duration-300 ${style}`}>
                            <span className="text-4xl md:text-6xl font-serif">{content}</span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
                {question.options.map((opt, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(opt.k)}
                        disabled={selectedKana !== null}
                        className="bg-slate-100 hover:bg-[#FDF0EB] hover:text-[#5C3A21] text-slate-500 hover:border-[#ECA68D] border-4 border-transparent py-6 md:py-8 rounded-2xl font-black text-4xl md:text-5xl font-serif transition-all shadow-sm active:scale-95"
                    >
                        {opt.k}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FindFillDrill;
