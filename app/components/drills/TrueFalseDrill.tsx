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
    isMulti?: boolean;
}

const TrueFalseDrill: React.FC<TrueFalseProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, onToggleSansSerif, isMulti = false }) => {
    const generateQuestion = useCallback((prevKanas: string[] = []) => {
        if (!groupChars || groupChars.length === 0) return { items: [{ kana: '?', romaji: '?' }], isTrue: true };
        
        const count = isMulti ? (Math.random() > 0.5 ? 2 : 3) : 1;
        const isTrue = Math.random() > 0.5;

        // Separate items into new (not used in prev question) and prev
        const newItems = groupChars.filter(c => !prevKanas.includes(c.k));
        const prevItems = groupChars.filter(c => prevKanas.includes(c.k));

        const shuffledNew = [...newItems].sort(() => 0.5 - Math.random());
        const shuffledPrev = [...prevItems].sort(() => 0.5 - Math.random());

        let selectedChars = [];
        if (count === 1) {
            // For single item, prefer completely new
            selectedChars = shuffledNew.length >= 1 ? [shuffledNew[0]] : [shuffledPrev[0]];
        } else {
            // For multi items, allow at most 1 item from prevKanas to be reused
            let pool = [...shuffledNew];
            if (shuffledPrev.length > 0) {
                pool.push(shuffledPrev[0]); 
            }
            pool = pool.sort(() => 0.5 - Math.random());
            selectedChars = pool.slice(0, Math.min(count, pool.length));
            
            // Fallback if group is too small
            if (selectedChars.length < count) {
                selectedChars = [...groupChars].sort(() => 0.5 - Math.random()).slice(0, count);
            }
        }

        const items = selectedChars.map(c => ({ kana: c.k, romaji: c.r }));

        if (!isTrue) {
            // Scramble "some" of them (between 1 and count)
            const scrambleCount = Math.floor(Math.random() * items.length) + 1;
            const indicesToScramble = [...Array(items.length).keys()].sort(() => 0.5 - Math.random()).slice(0, scrambleCount);
            
            indicesToScramble.forEach(idx => {
                const char = items[idx];
                
                // Collect romajis already present in the question to prevent duplicates
                const currentDisplayedRomaji = items.map((it, i) => i === idx ? null : it.romaji).filter(Boolean);

                // Find wrong romaji that isn't the correct answer AND isn't already displayed
                let otherItems = groupChars.filter(c => c.r !== char.romaji && !currentDisplayedRomaji.includes(c.r));
                
                if (otherItems.length === 0) {
                    otherItems = groupChars.filter(c => c.r !== char.romaji); // Fallback: just don't be the correct answer
                }
                if (otherItems.length === 0) {
                    otherItems = groupChars; // Absolute fallback
                }
                
                items[idx].romaji = otherItems[Math.floor(Math.random() * otherItems.length)].r;
            });
        }

        return { items, isTrue };
    }, [groupChars, isMulti]);

    const [question, setQuestion] = useState(generateQuestion());

    const handleAnswer = (answer: boolean) => {
        if (answer === question.isTrue) {
            onCorrect();
            setQuestion(generateQuestion(question.items.map(i => i.kana)));
        } else {
            onWrong();
        }
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full max-w-2xl mx-auto py-12">
            <div className="flex-1 flex items-center justify-center space-x-12 md:space-x-20">
                {question.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center">
                        <span className={`text-[120px] md:text-[180px] leading-none text-[#5C3A21] mb-8 ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                            {item.kana}
                        </span>
                        <span className="text-4xl text-[#5C3A21] font-arbutus tracking-wider">
                            {item.romaji}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex w-full justify-center space-x-24 mt-8">
                <button
                    onClick={() => handleAnswer(true)}
                    className="text-green-600 hover:text-green-500 hover:scale-120 font-medium font-outfit text-[84px] transition-all active:scale-95 leading-none w-48 h-48 flex items-center justify-center rounded-3xl"
                >
                    O
                </button>
                <button
                    onClick={() => handleAnswer(false)}
                    className="text-red-600 hover:text-red-500 hover:scale-120 font-outfit font-medium text-[80px] transition-all active:scale-95 leading-none w-48 h-48 flex items-center justify-center rounded-3xl"
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
