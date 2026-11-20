import React from 'react';
import { Star, X } from 'lucide-react';
import { QuizOverlayBackgroundSVG } from '../../QuizOverlayBackgroundSVG';

interface PreGameOverlayProps {
    stageNumber?: number | string;
    stageId?: string;
    title?: string;
    subtitle?: string;
    description: string;
    maxTime: number;
    isClosing: boolean;
    onClose: () => void;
    onStart: () => void;
    rulesPreset?: 'standard' | 'endless';
    starThresholds?: [number, number, number];
    bonusTimeText?: string;
}

export const PreGameOverlay: React.FC<PreGameOverlayProps> = ({
    stageNumber,
    stageId,
    title,
    subtitle,
    description,
    maxTime,
    isClosing,
    onClose,
    onStart,
    rulesPreset = 'standard',
    starThresholds,
    bonusTimeText,
}) => {
    const displayStageNumber = stageNumber !== undefined ? stageNumber : stageId;
    const displayTitle = title || subtitle;
    const thresholds = starThresholds || [20, 40, 60];
    const isEndless = rulesPreset === 'endless';

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-5xl md:aspect-[1.8/1] max-h-[92vh] overflow-y-auto bg-[#FFF5F0] md:bg-transparent rounded-3xl md:rounded-none border-2 md:border-none border-[#DF7956]/30 shadow-2xl flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <QuizOverlayBackgroundSVG className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl hidden md:block" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-[8%] md:right-[8%] z-20 p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 md:w-8 md:h-8 text-[#5A301E] opacity-50 hover:opacity-100 transition-opacity" />
                </button>

                <div className="relative z-10 w-full h-full p-5 sm:p-8 md:pt-[8%] md:pb-[10%] md:pl-[10%] md:pr-[10%] flex flex-col justify-between">
                    <div>
                        <p className="text-sm sm:text-base md:text-xl font-medium opacity-80 mb-1 md:mb-2 font-outfit">Tahap {displayStageNumber}</p>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-arbutus font-bold mb-2 md:mb-4">{displayTitle}</h2>
                        <p className="text-xs sm:text-base md:text-xl opacity-90 max-w-3xl font-outfit mb-2 md:mb-0">{description}</p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end mt-4 md:mt-auto gap-4">
                        <div className="space-y-2 md:space-y-4 font-outfit">
                            <h3 className="font-arbutus text-base sm:text-xl md:text-2xl font-medium mb-1.5 md:mb-4">Penilaian Tuntas</h3>
                            
                            {isEndless ? (
                                <>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Mencapai skor {thresholds[0]}</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Mencapai skor {thresholds[1]}</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Mencapai skor {thresholds[2]}</span>
                                    </div>
                                    {bonusTimeText && (
                                        <p className="text-xs sm:text-sm md:text-base text-[#C15A3D] font-medium pt-0.5 md:pt-1">
                                            Bonus Waktu: {bonusTimeText}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Permainan selesai</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Nyawa tidak berkurang</span>
                                    </div>
                                    <div className="flex items-center space-x-2.5 sm:space-x-4">
                                        <Star className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#C15A3D] text-[#C15A3D] shrink-0" />
                                        <span className="text-xs sm:text-base md:text-xl">Waktu tersisa tidak kurang dari {maxTime >= 30 ? 15 : maxTime / 2} detik</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:space-x-6 mt-2 md:mt-0">
                            <button 
                                onClick={onStart}
                                className="w-full md:w-56 py-3 md:py-0 md:h-56 rounded-2xl md:rounded-none bg-[#C15A3D] hover:bg-[#a84d33] transition-all text-white font-arbutus text-lg md:text-3xl flex items-center justify-center md:pr-8 hover:scale-105 active:scale-95 shadow-md md:[clip-path:polygon(0_0,0_100%,100%_50%)]"
                            >
                                <span className="md:-ml-6">Mulai</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
