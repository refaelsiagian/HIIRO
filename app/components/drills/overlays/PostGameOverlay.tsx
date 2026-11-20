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
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}>
            {/* Desktop View (>= md) - 100% UNTOUCHED ORIGINAL DESKTOP */}
            <div className={`hidden md:flex relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}>
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

            {/* Mobile View (< md) */}
            <div className={`md:hidden relative w-full max-w-[350px] sm:max-w-md max-h-[92vh] overflow-y-auto bg-[#FFF5F0] rounded-2xl border-2 border-[#DF7956]/30 shadow-2xl flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}>
                <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                    <h2 className="text-2xl sm:text-3xl font-arbutus font-bold text-center mb-5">
                        {isEndless 
                            ? getEndlessTitle() 
                            : (score >= targetScore ? 'Selesai!' : (lives <= 0 ? 'Nyawa Habis' : 'Waktu Habis'))}
                    </h2>

                    <div className="flex flex-col items-center my-auto px-1 gap-4">
                        {/* Petal Flower Section */}
                        <div className="flex flex-col items-center shrink-0 mt-3 mb-2">
                            <div className="relative flex items-center justify-center w-28 h-28">
                                <div className="petal-flower-modal">
                                    <PetalFlower starsEarned={currentPetals} highestPetals={highestPetals} />
                                </div>
                            </div>
                            <div className="mt-2 text-center">
                                <p className="font-arbutus font-medium text-xs sm:text-base">
                                    Tuntas Beruntun {currentPetals}x{currentPetals >= 5 ? ' (max)' : ''}
                                </p>
                                {highestPetals > currentPetals && (
                                    <p className="text-[10px] sm:text-xs font-outfit opacity-60 mt-0.5">
                                        Rekor Tertinggi: {highestPetals}x{highestPetals >= 5 ? ' (max)' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stars / Criteria Section */}
                        <div className="space-y-2 font-outfit w-full mt-3">
                            <h3 className="font-arbutus text-sm sm:text-lg font-medium mb-1.5">Penilaian Tuntas</h3>
                            
                            {isEndless ? (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= thresholds[0] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[0] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= thresholds[0] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[0]}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= thresholds[1] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[1] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= thresholds[1] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[1]}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= thresholds[2] ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= thresholds[2] ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= thresholds[2] ? '' : 'opacity-50'}`}>Mencapai skor {thresholds[2]}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm opacity-90 pt-0.5 font-semibold">
                                        Skor Akhir: {score}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= targetScore ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= targetScore ? '' : 'opacity-50'}`}>Permainan selesai</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= targetScore && lives === maxLives ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore && lives === maxLives ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= targetScore && lives === maxLives ? '' : 'opacity-50'}`}>Nyawa tidak berkurang</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Star 
                                            className={`w-4 h-4 shrink-0 ${score >= targetScore && timeLeft >= timeThreshold ? 'opacity-100' : 'opacity-30'}`}
                                            style={{ 
                                                color: 'var(--theme-star-color, #C15A3D)', 
                                                fill: score >= targetScore && timeLeft >= timeThreshold ? 'var(--theme-star-color, #C15A3D)' : 'none' 
                                            }} 
                                        />
                                        <span className={`text-xs sm:text-sm ${score >= targetScore && timeLeft >= timeThreshold ? '' : 'opacity-50'}`}>Waktu tersisa tidak kurang dari {timeThreshold} detik</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 sm:gap-8 items-center mt-6 font-outfit text-sm sm:text-lg font-bold">
                        <button onClick={onClose} className="px-6 py-2 rounded-full border border-[#5A301E]/40 hover:border-[#5A301E] hover:text-[#C15A3D] transition-colors active:scale-95">
                            Kembali
                        </button>
                        <button onClick={onReload} className="px-6 py-2 rounded-full bg-[#DF7956] text-white hover:bg-[#C15A3D] transition-colors shadow-md active:scale-95">
                            Main lagi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
