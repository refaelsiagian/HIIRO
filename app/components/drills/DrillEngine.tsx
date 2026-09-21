"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { Star, Pause, Heart, ArrowLeft } from 'lucide-react';

interface DrillEngineProps {
    category: string;
    section: string;
    groupId: string;
    stageId: string;
    maxTime: number; // e.g. 60
    maxLives: number; // e.g. 3
    targetScore: number; // How many correct answers to win
    children: (props: {
        onCorrect: () => void;
        onWrong: () => void;
        isSansSerif: boolean;
        onToggleSansSerif: () => void;
    }) => React.ReactNode;
    onClose: () => void;
    isSansSerif: boolean;
    onToggleSansSerif: () => void;
}

const DrillEngine: React.FC<DrillEngineProps> = ({
    category,
    section,
    groupId,
    stageId,
    maxTime,
    maxLives,
    targetScore,
    children,
    onClose,
    isSansSerif,
    onToggleSansSerif
}) => {
    const { completeStage, failStage } = useGameStore();

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [lives, setLives] = useState(maxLives);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [starsEarned, setStarsEarned] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const isFinal = groupId.startsWith('daishiken') || groupId.startsWith('shotesto');

    // COLORS LOGIC based on layout desc.txt
    let mainBg = "bg-app-bg";
    let panelBg = "bg-[#FFE8E0]";
    let borderColor = "border-[#E89A81]";
    let fontColor = "text-[#6F3E28]";
    let starColor = "fill-[#CC6E34] text-[#CC6E34]";

    if (isFinal) {
        panelBg = "bg-[#ECC5FF]";
        borderColor = "border-[#C681E8]";
        fontColor = "text-[#4A286F]";
        starColor = "fill-[#8F34CC] text-[#8F34CC]";
    }

    useEffect(() => {
        if (isFinished || isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleGameOver(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, isPaused]);

    const handleCorrect = () => {
        if (isFinished) return;
        setScore(prev => {
            const newScore = prev + 1;
            if (newScore >= targetScore) {
                handleGameOver(true);
            }
            return newScore;
        });
    };

    const handleWrong = () => {
        if (isFinished) return;
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                handleGameOver(false);
            }
            return newLives;
        });
    };

    const handleGameOver = (success: boolean) => {
        setIsFinished(true);

        if (!success) {
            failStage(category, section);
            setStarsEarned(0);
        } else {
            let stars = 0;
            // 1. Finish within time limit
            if (timeLeft > 0) stars += 1;
            // 2. Finish without consuming lives
            if (lives === maxLives) stars += 1;
            // 3. Finish with amount of seconds left (e.g. > 50% time)
            if (timeLeft >= maxTime / 2) stars += 1;

            setStarsEarned(stars);
            completeStage(category, section, groupId, stageId, stars, score);
        }
    };

    if (isFinished) {
        return (
            <div className={`min-h-screen ${mainBg} p-6 font-sans flex flex-col items-center justify-center`}>
                <div className={`${panelBg} p-12 rounded-[2rem] shadow-xl text-center border-4 ${borderColor} max-w-md w-full`}>
                    {starsEarned > 0 ? (
                        <>
                            <div className="flex justify-center space-x-2 mb-6">
                                {[1, 2, 3].map(star => (
                                    <Star key={star} className={`w-12 h-12 ${star <= starsEarned ? starColor : 'text-slate-200/50'}`} />
                                ))}
                            </div>
                            <h2 className={`text-4xl mb-4 ${fontColor} font-arbutus`}>Selesai!</h2>
                            <p className={`${fontColor} opacity-80 mb-8 font-medium font-outfit text-xl`}>Kamu mendapatkan {starsEarned} bintang!</p>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-6">💀</div>
                            <h2 className={`text-4xl mb-4 ${fontColor} font-arbutus`}>Gagal</h2>
                            <p className={`${fontColor} opacity-80 mb-8 font-medium font-outfit text-xl`}>Jangan menyerah! Coba lagi.</p>
                        </>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className={`w-full ${panelBg} filter brightness-95 ${fontColor} px-6 py-4 rounded-xl font-bold font-outfit text-lg border-2 ${borderColor} hover:brightness-90 transition-all`}
                        >
                            Ulangi Stage
                        </button>
                        <button
                            onClick={onClose}
                            className={`w-full bg-white ${fontColor} px-6 py-4 rounded-xl font-bold font-outfit text-lg border-2 ${borderColor} hover:bg-slate-50 transition-all`}
                        >
                            Kembali ke Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${mainBg} p-6 font-sans flex flex-col items-center justify-between relative overflow-hidden ${fontColor}`}>
            
            {/* TOP HUD */}
            <div className="w-full relative flex flex-col items-center pt-8">
                {/* Pause Button */}
                <button 
                    onClick={() => setIsPaused(true)}
                    className={`absolute top-8 right-8 md:right-12 hover:opacity-70 transition-opacity ${fontColor}`}
                >
                    <Pause size={36} fill="currentColor" strokeWidth={0} />
                </button>
                
                {/* Hearts */}
                <div className="flex space-x-2 mb-2">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-8 h-8 ${i < lives ? 'fill-red-600 text-red-600' : 'text-red-200/50'}`} 
                        />
                    ))}
                </div>
                
                {/* Timer */}
                <div className={`font-outfit text-[44px] leading-none ${fontColor}`}>
                    {timeLeft}
                </div>
            </div>

            {/* Game Content */}
            <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative">
                {children({ onCorrect: handleCorrect, onWrong: handleWrong, isSansSerif, onToggleSansSerif })}
            </div>

            {/* PAUSE MODAL */}
            {isPaused && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className={`${panelBg} p-12 rounded-[2rem] shadow-xl text-center border-4 ${borderColor} max-w-sm w-full mx-4`}>
                        <h2 className={`text-3xl mb-8 ${fontColor} font-arbutus`}>Dijeda</h2>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsPaused(false)}
                                className={`w-full ${panelBg} filter brightness-95 ${fontColor} px-6 py-4 rounded-xl font-bold font-outfit text-lg border-2 ${borderColor} hover:brightness-90 transition-all`}
                            >
                                Lanjutkan
                            </button>
                            <button
                                onClick={onClose}
                                className={`w-full bg-white ${fontColor} px-6 py-4 rounded-xl font-bold font-outfit text-lg border-2 ${borderColor} hover:bg-slate-50 transition-all`}
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrillEngine;
