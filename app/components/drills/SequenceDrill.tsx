"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';

interface SequenceDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
}

const SequenceDrill: React.FC<SequenceDrillProps> = ({ groupChars, onCorrect, onWrong }) => {
    const createNewQuestionData = useCallback((chars: CharItem[]) => {
        // Fallback for empty groups (like Daishiken placeholder)
        if (!chars || chars.length === 0) return { newSequence: [], newOptions: [] };
        
        // Ensure we have at least 3 chars for the drill (repeat if needed)
        let pool = [...chars];
        while (pool.length < 3) {
            pool = [...pool, ...chars];
        }

        const shuffled = pool.sort(() => 0.5 - Math.random());
        const seq = shuffled.slice(0, 3);
        const options = [...seq].sort(() => 0.5 - Math.random()); // Options just the 3 correct ones shuffled
        return {
            newSequence: seq,
            newOptions: options,
        };
    }, []);

    const [initialData] = useState(() => createNewQuestionData(groupChars));
    const [sequence, setSequence] = useState<CharItem[]>(initialData.newSequence);
    const [options, setOptions] = useState<CharItem[]>(initialData.newOptions);
    const [displayIndex, setDisplayIndex] = useState<number>(0);
    const [isDisplaying, setIsDisplaying] = useState<boolean>(true);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("Hafalkan urutannya...");

    const startNextQuestion = useCallback(() => {
        const { newSequence, newOptions } = createNewQuestionData(groupChars);
        setSequence(newSequence);
        setOptions(newOptions);
        setUserInput([]);
        setIsDisplaying(true);
        setDisplayIndex(0);
        setMessage("Hafalkan...");
    }, [groupChars, createNewQuestionData]);

    useEffect(() => {
        if (!isDisplaying) return;
        if (sequence.length === 0) return;

        const timer = setTimeout(() => {
            if (displayIndex < 2) {
                setDisplayIndex(prev => prev + 1);
            } else {
                setIsDisplaying(false);
                setMessage("Pilih sesuai urutan!");
                setDisplayIndex(3);
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [displayIndex, isDisplaying, sequence.length]);

    const handleChoice = (romaji: string) => {
        if (isDisplaying) return;

        const currentIndex = userInput.length;
        if (romaji !== sequence[currentIndex].r) {
            onWrong();
            // Reset this sequence attempt
            setUserInput([]);
            setIsDisplaying(true);
            setDisplayIndex(0);
            setMessage("Salah! Coba lagi hafalkan...");
            return;
        }

        const nextInput = [...userInput, romaji];
        setUserInput(nextInput);

        if (nextInput.length === 3) {
            onCorrect();
            setMessage("Benar!");
            setTimeout(startNextQuestion, 600);
        }
    };

    if (sequence.length === 0) return <div>No data</div>;

    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center border border-slate-100">
            <h2 className="text-xl font-bold mb-8 text-[#5C3A21]">{message}</h2>
            
            <div className="flex justify-center space-x-4 mb-12 h-32">
                {sequence.map((item, index) => {
                    const isRevealed = isDisplaying && index <= displayIndex;
                    const isAnswered = !isDisplaying && index < userInput.length;
                    
                    let content = "?";
                    let charToShow = item;
                    
                    if (isRevealed) content = item.k;
                    if (isAnswered) {
                        const answeredItem = sequence.find(s => s.r === userInput[index]);
                        content = answeredItem ? answeredItem.k : "?";
                    }

                    return (
                        <div 
                            key={index} 
                            className={`w-24 h-32 flex items-center justify-center rounded-2xl border-4 transition-all duration-300
                                ${isRevealed ? 'bg-[#FDF0EB] border-[#ECA68D] text-slate-800' : 
                                 isAnswered ? 'bg-[#FBE4D8] border-[#D97D61] text-slate-800' : 
                                 'bg-slate-50 border-slate-200 text-slate-300'}`}
                        >
                            <span className="text-5xl font-serif">{content}</span>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {options.map((opt, index) => {
                    const isUsed = userInput.includes(opt.r);
                    return (
                        <button
                            key={index}
                            onClick={() => handleChoice(opt.r)}
                            disabled={isDisplaying || isUsed}
                            className={`py-6 rounded-2xl font-black text-2xl uppercase transition-all
                                ${isDisplaying || isUsed 
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                                    : 'bg-[#FDF0EB] text-[#5C3A21] hover:bg-[#FBE4D8] hover:-translate-y-1 active:translate-y-0 shadow-md'}`}
                        >
                            {opt.r}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SequenceDrill;