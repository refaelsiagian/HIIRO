"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { ChevronsLeft, ChevronLeft, Ban, ChevronRight, ChevronsRight } from 'lucide-react';

interface FindFillDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    onToggleSansSerif?: () => void;
    isActive?: boolean;
}

const FindFillDrill: React.FC<FindFillDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    const capacity = groupChars.length;

    const generatePrefilledBoard = useCallback(() => {
        // Pick 2 or 3 random unique characters from groupChars
        // If capacity is smaller (e.g. 3 for ya yu yo), pick 1 or 2
        let count = Math.floor(Math.random() * 2) + 2; // 2 or 3
        if (capacity < 4) count = 1; 

        const shuffled = [...groupChars].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, [groupChars, capacity]);

    const generateQuestion = useCallback((currentBoards: CharItem[][], currentHidden: boolean[], previousCharRomaji?: string) => {
        if (!groupChars || groupChars.length === 0) return null;
        
        let availableChars = [...groupChars];
        
        // Filter out characters that exist in ALL current boards
        if (currentBoards.length === 4) {
            availableChars = groupChars.filter(char => {
                // Is this char missing from AT LEAST one NON-HIDDEN board?
                return currentBoards.some((board, idx) => !currentHidden[idx] && !board.some(c => c.r === char.r));
            });
            
            // Fallback just in case (should not happen since boards clear at 5)
            if (availableChars.length === 0) {
                availableChars = [...groupChars];
            }
        }

        // Prevent consecutive same characters if possible
        if (previousCharRomaji && availableChars.length > 1) {
            const filtered = availableChars.filter(c => c.r !== previousCharRomaji);
            if (filtered.length > 0) {
                availableChars = filtered;
            }
        }

        const char = availableChars[Math.floor(Math.random() * availableChars.length)];
        
        const isMismatch = Math.random() < 0.2; // 20% mismatch
        let romaji = char.r;
        
        if (isMismatch && groupChars.length > 1) {
            let options = groupChars.filter(c => c.r !== char.r);
            romaji = options[Math.floor(Math.random() * options.length)].r;
        }

        return { char, romaji, isMatch: !isMismatch };
    }, [groupChars]);

    const [boards, setBoards] = useState<CharItem[][]>([]);
    const [hiddenBoards, setHiddenBoards] = useState<boolean[]>([false, false, false, false]);
    const [question, setQuestion] = useState(generateQuestion([], [false, false, false, false]));

    useEffect(() => {
        if (boards.length === 0) {
            const initialBoards = [
                generatePrefilledBoard(),
                generatePrefilledBoard(),
                generatePrefilledBoard(),
                generatePrefilledBoard()
            ];
            setBoards(initialBoards);
            setQuestion(generateQuestion(initialBoards, [false, false, false, false]));
        }
    }, [boards.length, generatePrefilledBoard, generateQuestion]);

    const handleAction = (actionType: 'discard' | number) => {
        if (!isActive || !question) return;

        let newBoards = [...boards];
        let newHidden = [...hiddenBoards];

        // If any board is hidden (cleared previously), restore it FIRST
        for (let i = 0; i < 4; i++) {
            if (newHidden[i]) {
                newBoards[i] = generatePrefilledBoard();
                newHidden[i] = false;
            }
        }

        if (actionType === 'discard') {
            if (!question.isMatch) {
                // Correct discard
                setBoards(newBoards);
                setHiddenBoards(newHidden);
                setQuestion(generateQuestion(newBoards, newHidden, question.char.r));
            } else {
                // Wrong discard
                onWrong();
            }
        } else {
            const boardIndex = actionType;
            const targetBoard = boards[boardIndex]; 
            
            if (hiddenBoards[boardIndex]) {
                return; // Ignore clicks on disappeared boards
            }

            if (!question.isMatch) {
                // Sent a mismatch to a board! Wrong!
                onWrong();
            } else {
                // Sent a match to a board
                if (targetBoard.some(c => c.r === question.char.r)) {
                    // Board already has this letter
                    onWrong();
                } else {
                    // Correct placement!
                    newBoards[boardIndex] = [...targetBoard, question.char];
                    
                    if (newBoards[boardIndex].length >= capacity) {
                        // Board completed!
                        setBoards(newBoards); // Show the completed board briefly
                        setHiddenBoards(newHidden); // Commit any restored boards!
                        
                        // We simulate the board being hidden for the next question generation
                        const futureHidden = [...newHidden];
                        futureHidden[boardIndex] = true;
                        setQuestion(generateQuestion(newBoards, futureHidden, question.char.r));
                        
                        setTimeout(() => {
                            onCorrect(); // Increment global progress
                            
                            // Use functional state update to prevent stale closures if player clicked rapidly
                            setHiddenBoards(prevHidden => {
                                const nextHidden = [...prevHidden];
                                nextHidden[boardIndex] = true;
                                return nextHidden;
                            });
                        }, 500);
                        
                        return; // Early return to prevent normal state update below
                    } else {
                        // Just added a piece
                        setBoards(newBoards);
                        setHiddenBoards(newHidden);
                        setQuestion(generateQuestion(newBoards, newHidden, question.char.r));
                    }
                }
            }
        }
    };

    if (!question || boards.length < 4) return <div>Loading...</div>;

    const renderBoard = (board: CharItem[], index: number) => {
        const isHidden = hiddenBoards[index];

        return (
            <div 
                key={index} 
                onClick={() => handleAction(index)}
                className={`relative w-[100px] h-[400px] md:w-[120px] md:h-[500px] flex justify-center items-center transition-all duration-500 cursor-pointer hover:brightness-105 ${
                    isHidden ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                }`}
            >
                {/* Board SVG */}
                <div 
                    className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                    style={{ 
                        maskImage: 'url(/icons/board.svg)', 
                        WebkitMaskImage: 'url(/icons/board.svg)', 
                        maskSize: '100% 100%', 
                        WebkitMaskSize: '100% 100%',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                />
                
                {/* Slots */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 md:py-16">
                    {Array.from({ length: capacity }).map((_, slotIdx) => {
                        const isFilled = slotIdx < board.length;
                        const charItem = isFilled ? board[slotIdx] : null;
                        const isCompound = charItem ? charItem.k.length > 1 : false;

                        return (
                            <div key={slotIdx} className="w-full px-1 h-12 flex items-center justify-center">
                                {isFilled && charItem ? (
                                    <span 
                                        className={`whitespace-nowrap leading-none select-none text-[#5C3A21] ${
                                            isCompound 
                                                ? 'text-2xl sm:text-3xl md:text-[32px] tracking-tight' 
                                                : 'text-4xl md:text-5xl'
                                        } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                                    >
                                        {charItem.k}
                                    </span>
                                ) : (
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C15A3D] rounded-sm transform rotate-45 opacity-80" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMobileBoard = (board: CharItem[], index: number) => {
        const isHidden = hiddenBoards[index];

        return (
            <button
                key={index}
                onClick={() => handleAction(index)}
                disabled={isHidden || !isActive}
                className={`relative flex-1 max-w-[84px] h-[310px] sm:h-[340px] flex justify-center items-center transition-all duration-300 active:scale-95 cursor-pointer select-none ${
                    isHidden ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 hover:brightness-105 drop-shadow-md'
                }`}
            >
                {/* Board SVG - Authentic peachy #FFB7A3 */}
                <div 
                    className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                    style={{ 
                        maskImage: 'url(/icons/board.svg)', 
                        WebkitMaskImage: 'url(/icons/board.svg)', 
                        maskSize: '100% 100%', 
                        WebkitMaskSize: '100% 100%',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                />
                
                {/* Slots */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-10 sm:py-11">
                    {Array.from({ length: capacity }).map((_, slotIdx) => {
                        const isFilled = slotIdx < board.length;
                        const charItem = isFilled ? board[slotIdx] : null;
                        const isCompound = charItem ? charItem.k.length > 1 : false;

                        return (
                            <div key={slotIdx} className="w-full px-1 h-10 flex items-center justify-center">
                                {isFilled && charItem ? (
                                    <span 
                                        className={`whitespace-nowrap leading-none select-none text-[#5C3A21] ${
                                            isCompound 
                                                ? 'text-xl sm:text-2xl tracking-tight' 
                                                : 'text-3xl sm:text-4xl'
                                        } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                                    >
                                        {charItem.k}
                                    </span>
                                ) : (
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#C15A3D] rounded-sm transform rotate-45 opacity-80" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </button>
        );
    };

    return (
        <>
            {/* DESKTOP VIEW (>= md) - 100% UNTOUCHED ORIGINAL LAYOUT */}
            <div className="hidden md:flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative select-none -translate-y-6 sm:-translate-y-8 md:-translate-y-10">
                {/* Title / Instruction: close to boards */}
                <div className="w-full flex justify-center mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-bold font-sans opacity-90">Tentukan letaknya</h2>
                </div>
                
                <div className="flex w-full items-center justify-center gap-6 sm:gap-8 md:gap-14 lg:gap-16">
                    
                    {/* Left Boards */}
                    <div className="flex space-x-2 md:space-x-6">
                        {renderBoard(boards[0], 0)}
                        {renderBoard(boards[1], 1)}
                    </div>

                    {/* Center Control */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center justify-center h-[260px] md:h-[300px]">
                            <span 
                                className={`whitespace-nowrap select-none leading-none text-[#5C3A21] ${
                                    question.char.k.length > 1
                                        ? 'text-[100px] sm:text-[130px] md:text-[160px]'
                                        : 'text-[120px] md:text-[180px]'
                                } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                            >
                                {question.char.k}
                            </span>
                            <span className="text-4xl md:text-5xl font-arbutus text-[#5C3A21] mt-6 md:mt-8">
                                {question.romaji}
                            </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-4 md:space-x-6 mt-16 md:mt-20">
                            {[
                                { action: 0, icon: <ChevronsLeft size={28} /> },
                                { action: 1, icon: <ChevronLeft size={28} /> },
                                { action: 'discard', icon: <Ban size={24} strokeWidth={2.5} /> },
                                { action: 2, icon: <ChevronRight size={28} /> },
                                { action: 3, icon: <ChevronsRight size={28} /> },
                            ].map((btn, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleAction(btn.action as any)} 
                                    className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 drop-shadow-md cursor-pointer"
                                >
                                    <div 
                                        className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                                        style={{ 
                                            maskImage: 'url(/icons/shuriken.svg)', 
                                            WebkitMaskImage: 'url(/icons/shuriken.svg)', 
                                            maskSize: 'contain', 
                                            WebkitMaskSize: 'contain',
                                            maskPosition: 'center',
                                            WebkitMaskPosition: 'center',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat'
                                        }}
                                    />
                                    <span className="relative z-10 text-[#5C3A21]">
                                        {btn.icon}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Boards */}
                    <div className="flex space-x-2 md:space-x-6">
                        {renderBoard(boards[2], 2)}
                        {renderBoard(boards[3], 3)}
                    </div>

                </div>
            </div>

            {/* MOBILE VIEW (< md) - VERTICAL FLOW: KANA TOP, BOARDS MIDDLE, DISCARD BOTTOM */}
            <div className="flex md:hidden flex-1 w-full max-w-md mx-auto flex-col items-center justify-center text-[#5C3A21] relative select-none min-h-0 px-2 py-2 -translate-y-6 sm:-translate-y-8">
                
                {/* Top Section: Title & Question Card - comfortably spaced from progress bar */}
                <div className="w-full flex flex-col items-center mb-3 sm:mb-5 shrink-0 pt-1">
                    <h2 className="text-base font-bold font-sans opacity-90 mb-0.5">Tentukan letaknya</h2>
                    
                    <div className="flex flex-col items-center justify-center py-0.5">
                        <span 
                            className={`whitespace-nowrap select-none leading-none text-[#5C3A21] ${
                                question.char.k.length > 1
                                    ? 'text-6xl sm:text-7xl'
                                    : 'text-7xl sm:text-8xl'
                            } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                        >
                            {question.char.k}
                        </span>
                        <span className="text-2xl sm:text-3xl font-arbutus text-[#5C3A21] mt-1">
                            {question.romaji}
                        </span>
                    </div>
                </div>

                {/* Middle Section: 4 Bigger Boards Side-by-Side (Bigger, Centered, Authentic Peachy Color) */}
                <div className="w-full flex justify-center items-center gap-2 sm:gap-2.5 my-1 shrink-0">
                    {boards.map((board, idx) => renderMobileBoard(board, idx))}
                </div>

                {/* Bottom Section: Single Discard / Ban Button */}
                <div className="w-full flex flex-col items-center justify-center shrink-0 mt-5 sm:mt-7 pb-2">
                    <button
                        onClick={() => handleAction('discard')}
                        disabled={!isActive}
                        className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 drop-shadow-lg cursor-pointer"
                        title="Buang / Mismatch"
                    >
                        <div 
                            className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                            style={{ 
                                maskImage: 'url(/icons/shuriken.svg)', 
                                WebkitMaskImage: 'url(/icons/shuriken.svg)', 
                                maskSize: 'contain', 
                                WebkitMaskSize: 'contain',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat'
                            }}
                        />
                        <span className="relative z-10 text-[#5C3A21]">
                            <Ban size={28} strokeWidth={2.5} />
                        </span>
                    </button>
                    <span className="text-xs font-sans text-[#5C3A21]/70 mt-1 font-medium">Buang jika salah</span>
                </div>

            </div>
        </>
    );
};

export default FindFillDrill;
