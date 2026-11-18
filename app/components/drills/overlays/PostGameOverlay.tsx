import React from 'react';
import { Star } from 'lucide-react';
import { PetalFlower } from '../../PetalFlower';
import { QuizOverlayBackgroundSVG } from '../../QuizOverlayBackgroundSVG';

interface PostGameOverlayProps {
    score: number;
    targetScore: number;
    lives: number;
    maxLives: number;
    timeLeft: number;
    maxTime: number;
    currentPetals: number;
    highestPetals?: number;
    isClosing: boolean;
    onClose: () => void;
    onReload: () => void;
    rulesPreset?: 'standard' | 'endless';
    starThresholds?: [number, number, number];
}

export const PostGameOverlay: React.FC<PostGameOverlayProps> = ({
    score,
    targetScore,
    lives,
    maxLives,
    timeLeft,
    maxTime,
    currentPetals,
    highestPetals = currentPetals,
    isClosing,
    onClose,
    onReload,
    rulesPreset = 'standard',
    starThresholds,
}) => {
    const timeThreshold = maxTime >= 30 ? 15 : maxTime / 2;
    const isEndless = rulesPreset === 'endless';
    const thresholds = starThresholds || [20, 40, 60];

    const getEndlessTitle = () => {
        if (score >= thresholds[2]) return 'Sempurna!';
        if (score >= thresholds[1]) return 'Hebat!';
        if (score >= thresholds[0]) return 'Bagus!';
        return lives <= 0 ? 'Nyawa Habis' : 'Waktu Habis';
    };

    return (
        <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}>
            <div className={`relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}>
                <QuizOverlayBackgroundSVG className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl" />
                <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between pt-[8%] pb-[10%] pl-[10%] pr-[10%]">
                    <h2 className="text-5xl font-arbutus font-bold text-center">
                        {isEndless 
                            ? getEndlessTitle() 
                            : (score >= targetScore ? 'Selesai!' : (lives <= 0 ? 'Nyawa Habis' : 'Waktu Habis'))}
                    </h2>

                    <div className="flex justify-between items-center mt-6 mb-auto px-8">
                        <div className="space-y-4 font-outfit">
                            <h3 className="font-arbutus text-2xl font-medium mb-6">Penilaian Tuntas</h3>
                            
                            {isEndless ? (
                                <>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= thresholds[0] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[0] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= thresholds[0] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[0]}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= thresholds[1] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[1] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= thresholds[1] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[1]}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= thresholds[2] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[2] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= thresholds[2] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[2]}</span>
                                    </div>
                                    <p className="text-xl opacity-90 pt-1 font-semibold">
                                        Skor Akhir: {score}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= targetScore ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= targetScore ? '' : 'opacity-50'}`}>Permainan selesai</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= targetScore && lives === maxLives ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore && lives === maxLives ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= targetScore && lives === maxLives ? '' : 'opacity-50'}`}>Nyawa tidak berkurang</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Star 
                                            className={`w-8 h-8 ${score >= targetScore && timeLeft >= timeThreshold ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore && timeLeft >= timeThreshold ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xl ${score >= targetScore && timeLeft >= timeThreshold ? '' : 'opacity-50'}`}>Waktu tersisa tidak kurang dari {timeThreshold} detik</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-48 h-48 relative">
                                <PetalFlower starsEarned={currentPetals} highestPetals={highestPetals} />
                            </div>
                            <div className="mt-8 text-center">
                                <p className="font-arbutus font-medium text-xl">
                                    Tuntas Beruntun {currentPetals}x{currentPetals >= 5 ? ' (max)' : ''}
                                </p>
                                {highestPetals > currentPetals && (
                                    <p className="text-xs font-outfit opacity-60 mt-1">
                                        Rekor Tertinggi: {highestPetals}x{highestPetals >= 5 ? ' (max)' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-around items-end mt-10 font-outfit text-2xl font-bold">
                        <button onClick={onClose} className="hover:text-[#C15A3D] transition-colors">
                            Kembali
                        </button>
                        <button onClick={onReload} className="hover:text-[#C15A3D] transition-colors">
                            Main lagi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
