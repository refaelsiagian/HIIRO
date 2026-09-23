import React from 'react';
import { Star, X } from 'lucide-react';

interface PreGameOverlayProps {
    stageId: string;
    subtitle: string;
    description: string;
    maxTime: number;
    isClosing: boolean;
    onClose: () => void;
    onStart: () => void;
}

export const PreGameOverlay: React.FC<PreGameOverlayProps> = ({
    stageId,
    subtitle,
    description,
    maxTime,
    isClosing,
    onClose,
    onStart
}) => {
    return (
        <div 
            className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <img src="/icons/quiz-overlay.svg" className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl" alt="Background" />
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-[8%] right-[8%] z-20 p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                    <X className="w-8 h-8 text-[#5A301E] opacity-50 hover:opacity-100 transition-opacity" />
                </button>

                <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between pt-[8%] pb-[10%] pl-[10%] pr-[10%]">
                    <div>
                        <p className="text-xl font-medium opacity-80 mb-2 font-outfit">Tahap {stageId}</p>
                        <h2 className="text-5xl font-arbutus font-bold mb-4">{subtitle}</h2>
                        <p className="text-xl opacity-90 max-w-2xl font-outfit">{description}</p>
                    </div>

                    <div className="flex justify-between items-end mt-auto">
                        <div className="space-y-4 font-outfit">
                            <h3 className="font-arbutus text-2xl font-medium mb-6">Penilaian Tuntas</h3>
                            
                            <div className="flex items-center space-x-4">
                                <Star className="w-8 h-8 fill-[#C15A3D] text-[#C15A3D]" />
                                <span className="text-xl">Permainan selesai</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Star className="w-8 h-8 fill-[#C15A3D] text-[#C15A3D]" />
                                <span className="text-xl">Nyawa tidak berkurang</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Star className="w-8 h-8 fill-[#C15A3D] text-[#C15A3D]" />
                                <span className="text-xl">Waktu tersisa tidak kurang dari {maxTime >= 30 ? 15 : maxTime / 2} detik</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <button 
                                onClick={onStart}
                                className="w-56 h-56 bg-[#C15A3D] hover:bg-[#a84d33] transition-all text-white font-arbutus text-3xl flex items-center justify-center pr-8 hover:scale-105"
                                style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}
                            >
                                <span className="-ml-6">Mulai</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
