import React from 'react';
import { PetalSVG } from './PetalSVG';

interface PetalFlowerProps {
    starsEarned: number;
    className?: string;
    petalColor?: string;
}

export const PetalFlower: React.FC<PetalFlowerProps> = ({ starsEarned, className = '', petalColor }) => {
    // 5 petals rotated in a circle
    const angles = [0, 72, 144, 216, 288];

    return (
        <div className={`relative w-48 h-48 ${className}`}>
            {angles.map((angle, index) => {
                const isFilled = index < starsEarned;
                return (
                    <div
                        key={index}
                        className="absolute inset-0 flex justify-center"
                        style={{
                            transform: `rotate(${angle}deg)`,
                            transformOrigin: '50% 50%',
                        }}
                    >
                        <div className="w-16 h-20 -mt-6">
                            <PetalSVG
                                isFilled={isFilled}
                                style={{ color: petalColor || 'var(--theme-petal-bg, #C15A3D)' }}
                                className={isFilled ? '' : 'opacity-70'}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
