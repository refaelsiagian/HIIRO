import React, { useState } from 'react';
import { QuizOverlayBackgroundSVG } from '../../QuizOverlayBackgroundSVG';

interface PauseOverlayProps {
    onContinue: () => void;
    onReturnToMenu: () => void;
    onRestart: () => void;
    isClosing?: boolean;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onContinue, onReturnToMenu, onRestart, isClosing: externalIsClosing }) => {
    const [internalIsClosing, setInternalIsClosing] = useState(false);
    const isClosing = externalIsClosing !== undefined ? externalIsClosing : internalIsClosing;
    
    const handleContinue = () => {
        if (internalIsClosing) return;
        setInternalIsClosing(true);
        setTimeout(() => {
            onContinue();
        }, 220);
    };

    const handleReturn = () => {
        if (internalIsClosing) return;
        setInternalIsClosing(true);
        setTimeout(() => {
            onReturnToMenu();
        }, 220);
    };

    const handleRestart = () => {
        if (internalIsClosing) return;
        onRestart();
    };

    return (
        <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : 'animate-fadein'}`}>
            <div className={`relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : 'animate-popup'}`}>
                <QuizOverlayBackgroundSVG className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl" />
                
                <div className="relative z-10 w-full h-full p-8 flex flex-col justify-center items-center">
                    <div className="text-center mb-16 mt-[8%]">
                        <h2 className="text-6xl font-arbutus font-bold mb-6">Tertunda</h2>
                        <p className="text-2xl font-outfit opacity-90">Tunda hanya berlaku 1 kali tiap permainan</p>
                    </div>

                    <div className="flex w-full justify-around items-end mt-auto mb-[8%] px-16 font-outfit text-2xl font-bold">
                        <button onClick={handleReturn} disabled={internalIsClosing} className="hover:text-[#C15A3D] transition-colors disabled:pointer-events-none">
                            Kembali ke menu
                        </button>
                        <button onClick={handleRestart} disabled={internalIsClosing} className="hover:text-[#C15A3D] transition-colors disabled:pointer-events-none">
                            Ulang
                        </button>
                        <button onClick={handleContinue} disabled={internalIsClosing} className="hover:text-[#C15A3D] transition-colors disabled:pointer-events-none">
                            Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
