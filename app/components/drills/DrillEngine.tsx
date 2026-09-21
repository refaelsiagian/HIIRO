"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { Star, Clock, Heart, ArrowLeft } from 'lucide-react';

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
    }) => React.ReactNode;
    onClose: () => void;
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
    onClose
}) => {
    const { completeStage, failStage } = useGameStore();

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [lives, setLives] = useState(maxLives);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [starsEarned, setStarsEarned] = useState(0);

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
        if (isFinished) return;

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
    }, [isFinished]);

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
        <div className={`min-h-screen ${mainBg} p-6 font-sans flex flex-col items-center ${fontColor}`}>
            {/* HUD */}
            <div className={`w-full max-w-4xl flex justify-between items-center mb-8 ${panelBg} p-4 rounded-2xl shadow-sm border-2 ${borderColor}`}>
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className={`font-bold font-outfit text-lg hover:opacity-70 transition-opacity flex items-center`}>
                        <ArrowLeft size={24} strokeWidth={2} className="mr-2" />
                        Kembali
                    </button>
                    <div className={`h-6 w-px ${borderColor} border-l-2`}></div>
                    <div className={`flex items-center font-bold font-outfit text-xl`}>
                        <Clock className="w-6 h-6 mr-2" />
                        {timeLeft}s
                    </div>
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="flex space-x-1">
                        {[...Array(maxLives)].map((_, i) => (
                            <Heart key={i} className={`w-6 h-6 ${i < lives ? 'fill-red-500 text-red-500' : 'text-slate-200/50'}`} />
                        ))}
                    </div>
                    <div className={`font-black font-outfit text-xl filter brightness-90 px-4 py-1 rounded-full border ${borderColor}`}>
                        {score} / {targetScore}
                    </div>
                </div>
            </div>

            {/* Game Content */}
            <div className="w-full max-w-4xl flex-1 flex flex-col justify-center relative">
                {children({ onCorrect: handleCorrect, onWrong: handleWrong })}
            </div>
        </div>
    );
};

export default DrillEngine;
