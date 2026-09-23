import React from 'react';

interface CountdownOverlayProps {
    isClosing: boolean;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ isClosing }) => {
    return (
        <div className={`absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${isClosing ? 'animate-fadeout' : ''}`}>
            <div className={`relative w-full max-w-5xl aspect-[1.8/1] max-h-[90vh] flex items-center justify-center text-[#5A301E] ${isClosing ? 'animate-popdown' : ''}`}>
                <img src="/icons/quiz-overlay.svg" className="absolute inset-0 w-full h-full object-fill drop-shadow-2xl" alt="Background" />
                <div className="relative z-10 flex items-center justify-center">
                    <h2 className="text-6xl font-arbutus font-bold">Bersiap..</h2>
                </div>
            </div>
        </div>
    );
};
