import React from 'react';
import { Star } from 'lucide-react';
import { PetalFlower } from '../../PetalFlower';

interface PostGameOverlayProps {
    score: number;
    targetScore: number;
    lives: number;
    maxLives: number;
    timeLeft: number;
    maxTime: number;
    currentPetals: number;
    isClosing: boolean;
    onClose: () => void;
    onReload: () => void;
}

export const PostGameOverlay: React.FC<PostGameOverlayProps> = ({
    score,
    targetScore,
    lives,
    maxLives,
    timeLeft,
    maxTime,
    currentPetals,
    isClosing,
    onClose,
    onReload
}) => {
    const timeThreshold = maxTime >= 30 ? 15 : maxTime / 2;

    return (
        <div className={`absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}>
            <div className={`relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}>
                <img src="/icons/quiz-overlay.svg" className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl" alt="Background" />
                <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between pt-[8%] pb-[10%] pl-[10%] pr-[10%]">
                    <h2 className="text-5xl font-arbutus font-bold text-center">
                        {score >= targetScore ? 'Selesai!' : (lives <= 0 ? 'Nyawa Habis' : 'Waktu Habis')}
                    </h2>

                    <div className="flex justify-between items-center mt-6 mb-auto px-8">
                        <div className="space-y-4 font-outfit">
                            <h3 className="font-arbutus text-2xl font-medium mb-6">Penilaian Tuntas</h3>
                            
                            <div className="flex items-center space-x-4">
                                <Star className={`w-8 h-8 ${score >= targetScore ? 'fill-[#C15A3D] text-[#C15A3D]' : 'text-[#C15A3D] opacity-30'}`} />
                                <span className={`text-xl ${score >= targetScore ? '' : 'opacity-50'}`}>Permainan selesai</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Star className={`w-8 h-8 ${score >= targetScore && lives === maxLives ? 'fill-[#C15A3D] text-[#C15A3D]' : 'text-[#C15A3D] opacity-30'}`} />
                                <span className={`text-xl ${score >= targetScore && lives === maxLives ? '' : 'opacity-50'}`}>Nyawa tidak berkurang</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Star className={`w-8 h-8 ${score >= targetScore && timeLeft >= timeThreshold ? 'fill-[#C15A3D] text-[#C15A3D]' : 'text-[#C15A3D] opacity-30'}`} />
                                <span className={`text-xl ${score >= targetScore && timeLeft >= timeThreshold ? '' : 'opacity-50'}`}>Waktu tersisa tidak kurang dari {timeThreshold} detik</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-48 h-48 relative">
                                <PetalFlower starsEarned={currentPetals} />
                            </div>
                            <p className="mt-8 font-arbutus font-medium text-xl">
                                Tuntas Beruntun {currentPetals}x
                            </p>
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
