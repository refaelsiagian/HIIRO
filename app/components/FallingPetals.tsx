import React from 'react';

interface FallingPetalsProps {
    color?: string;
    isDimmed?: boolean;
}

interface Particle {
    id: number;
    left: number; // percentage (0 - 100)
    size: number; // px
    fallDuration: number; // seconds
    fallDelay: number; // negative seconds for immediate immersion
    swayDuration: number; // seconds
    swayDelay: number; // seconds
    swayType: 1 | 2 | 3 | 4;
    opacity: number;
    isPetal: boolean;
}

// Deterministic set of particles for hydration consistency
const PARTICLES: Particle[] = [
    { id: 0, left: 3, size: 10, fallDuration: 15, fallDelay: -1.2, swayDuration: 3.8, swayDelay: 0, swayType: 1, opacity: 0.14, isPetal: false },
    { id: 1, left: 8, size: 18, fallDuration: 18, fallDelay: -5.4, swayDuration: 4.6, swayDelay: -2.1, swayType: 2, opacity: 0.18, isPetal: true },
    { id: 2, left: 14, size: 24, fallDuration: 22, fallDelay: -11.0, swayDuration: 5.4, swayDelay: -4.3, swayType: 3, opacity: 0.22, isPetal: true },
    { id: 3, left: 19, size: 12, fallDuration: 16, fallDelay: -14.8, swayDuration: 4.0, swayDelay: -1.5, swayType: 4, opacity: 0.15, isPetal: false },
    { id: 4, left: 24, size: 21, fallDuration: 20, fallDelay: -3.6, swayDuration: 4.8, swayDelay: -3.2, swayType: 1, opacity: 0.25, isPetal: true },
    { id: 5, left: 28, size: 16, fallDuration: 17, fallDelay: -8.9, swayDuration: 5.2, swayDelay: -0.8, swayType: 2, opacity: 0.17, isPetal: true },
    { id: 6, left: 34, size: 22, fallDuration: 23, fallDelay: -17.2, swayDuration: 5.8, swayDelay: -4.5, swayType: 3, opacity: 0.20, isPetal: true },
    { id: 7, left: 39, size: 9, fallDuration: 14, fallDelay: -6.1, swayDuration: 3.6, swayDelay: -2.7, swayType: 4, opacity: 0.13, isPetal: false },
    { id: 8, left: 44, size: 19, fallDuration: 19, fallDelay: -12.4, swayDuration: 4.4, swayDelay: -1.9, swayType: 1, opacity: 0.21, isPetal: true },
    { id: 9, left: 49, size: 25, fallDuration: 24, fallDelay: -18.6, swayDuration: 5.6, swayDelay: -3.8, swayType: 2, opacity: 0.26, isPetal: true },
    { id: 10, left: 53, size: 15, fallDuration: 16, fallDelay: -4.5, swayDuration: 4.2, swayDelay: -0.5, swayType: 3, opacity: 0.16, isPetal: true },
    { id: 11, left: 58, size: 11, fallDuration: 15, fallDelay: -9.8, swayDuration: 3.9, swayDelay: -2.4, swayType: 4, opacity: 0.14, isPetal: false },
    { id: 12, left: 63, size: 20, fallDuration: 21, fallDelay: -15.1, swayDuration: 5.0, swayDelay: -4.1, swayType: 1, opacity: 0.22, isPetal: true },
    { id: 13, left: 67, size: 17, fallDuration: 18, fallDelay: -2.3, swayDuration: 4.7, swayDelay: -1.2, swayType: 2, opacity: 0.19, isPetal: true },
    { id: 14, left: 72, size: 23, fallDuration: 22, fallDelay: -10.5, swayDuration: 5.5, swayDelay: -3.5, swayType: 3, opacity: 0.24, isPetal: true },
    { id: 15, left: 76, size: 10, fallDuration: 14, fallDelay: -7.7, swayDuration: 3.7, swayDelay: -0.9, swayType: 4, opacity: 0.13, isPetal: false },
    { id: 16, left: 81, size: 19, fallDuration: 19, fallDelay: -16.3, swayDuration: 4.5, swayDelay: -2.8, swayType: 1, opacity: 0.20, isPetal: true },
    { id: 17, left: 85, size: 24, fallDuration: 23, fallDelay: -3.9, swayDuration: 5.7, swayDelay: -4.7, swayType: 2, opacity: 0.25, isPetal: true },
    { id: 18, left: 89, size: 14, fallDuration: 17, fallDelay: -13.2, swayDuration: 4.1, swayDelay: -1.6, swayType: 3, opacity: 0.16, isPetal: true },
    { id: 19, left: 93, size: 11, fallDuration: 15, fallDelay: -8.1, swayDuration: 3.5, swayDelay: -2.2, swayType: 4, opacity: 0.14, isPetal: false },
    { id: 20, left: 96, size: 20, fallDuration: 20, fallDelay: -19.5, swayDuration: 4.9, swayDelay: -3.9, swayType: 1, opacity: 0.23, isPetal: true },
    { id: 21, left: 6, size: 15, fallDuration: 17, fallDelay: -13.5, swayDuration: 4.3, swayDelay: -0.7, swayType: 2, opacity: 0.17, isPetal: true },
    { id: 22, left: 30, size: 13, fallDuration: 16, fallDelay: -2.8, swayDuration: 4.0, swayDelay: -2.9, swayType: 3, opacity: 0.15, isPetal: true },
    { id: 23, left: 55, size: 22, fallDuration: 21, fallDelay: -7.2, swayDuration: 5.3, swayDelay: -1.8, swayType: 1, opacity: 0.21, isPetal: true },
    { id: 24, left: 78, size: 16, fallDuration: 18, fallDelay: -12.0, swayDuration: 4.6, swayDelay: -4.0, swayType: 2, opacity: 0.18, isPetal: true },
    { id: 25, left: 41, size: 12, fallDuration: 15, fallDelay: -16.0, swayDuration: 3.8, swayDelay: -1.1, swayType: 4, opacity: 0.13, isPetal: false },
];

export const FallingPetals: React.FC<FallingPetalsProps> = ({ color = '#DF7956', isDimmed = false }) => {
    return (
        <div 
            className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-700 ease-out"
            style={{ 
                color,
                filter: isDimmed ? 'blur(3.5px)' : 'blur(0px)',
                opacity: isDimmed ? 0.35 : 1,
            }}
            aria-hidden="true"
        >
            {PARTICLES.map((p) => (
                <div
                    key={p.id}
                    className="absolute top-0 will-change-transform"
                    style={{
                        left: `${p.left}%`,
                        animation: `fallingPetal ${p.fallDuration}s linear ${p.fallDelay}s infinite`,
                    }}
                >
                    <div
                        style={{
                            width: `${p.size}px`,
                            height: `${p.size * (p.isPetal ? 1.32 : 1)}px`,
                            opacity: p.opacity,
                            animation: `swayPetal${p.swayType} ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite`,
                        }}
                    >
                        {p.isPetal ? (
                            <svg 
                                viewBox="0 0 44 58" 
                                fill="currentColor" 
                                className="w-full h-full drop-shadow-sm"
                            >
                                <path d="M13.0947 1.37598C14.2582 1.27685 15.4438 1.74031 17.0352 2.40137C18.3607 2.95201 19.9912 3.64659 21.748 3.68262C23.716 3.72296 25.4585 3.02431 26.8896 2.46484C28.2664 1.92664 29.3613 1.51361 30.4844 1.48145C32.6199 1.53947 34.7625 2.68852 36.6592 4.48437C38.5522 6.27678 40.0645 8.59061 40.9238 10.6611C42.0926 13.4777 42.4549 16.2856 42.4209 19.4316C42.3534 25.6668 39.7768 32.2463 37.0264 38.0986C36.7923 38.5965 36.58 39.0986 36.3799 39.5713C36.0371 40.3808 35.7258 41.1106 35.3457 41.792L35.1787 42.0811C33.0552 45.6126 30.5499 48.974 27.6338 51.8018C25.9127 53.4002 24.0808 54.6297 22.0215 55.8213C21.8688 55.7373 21.717 55.6524 21.5654 55.5693C20.822 55.1621 20.1016 54.7675 19.4248 54.3603C14.9677 51.3656 11.6261 46.6704 8.65527 41.9463C8.2149 41.2459 7.87312 40.4355 7.48633 39.5068C7.38833 39.2715 7.28703 39.0284 7.18164 38.7832L6.85156 38.0469L6.22266 36.6904C3.09801 29.8459 0.384102 22.0435 1.70508 14.9521C2.26471 11.9486 3.57297 8.65706 5.43945 6.37012C7.46869 3.88388 10.2247 1.63957 13.0947 1.37598Z" />
                            </svg>
                        ) : (
                            <div className="w-full h-full rounded-full bg-current blur-[0.4px]" />
                        )}
                    </div>
                </div>
            ))}

            <style jsx global>{`
                @keyframes fallingPetal {
                    0% {
                        transform: translateY(-80px);
                    }
                    100% {
                        transform: translateY(calc(100vh + 80px));
                    }
                }

                @keyframes swayPetal1 {
                    0% {
                        transform: translateX(-24px) rotate(0deg) rotateY(0deg);
                    }
                    50% {
                        transform: translateX(24px) rotate(45deg) rotateY(55deg);
                    }
                    100% {
                        transform: translateX(-24px) rotate(-30deg) rotateY(0deg);
                    }
                }

                @keyframes swayPetal2 {
                    0% {
                        transform: translateX(30px) rotate(20deg) rotateX(10deg);
                    }
                    50% {
                        transform: translateX(-26px) rotate(-40deg) rotateX(50deg);
                    }
                    100% {
                        transform: translateX(30px) rotate(20deg) rotateX(10deg);
                    }
                }

                @keyframes swayPetal3 {
                    0% {
                        transform: translateX(-35px) rotate(-15deg) rotateY(30deg);
                    }
                    50% {
                        transform: translateX(35px) rotate(60deg) rotateY(0deg);
                    }
                    100% {
                        transform: translateX(-35px) rotate(-15deg) rotateY(30deg);
                    }
                }

                @keyframes swayPetal4 {
                    0% {
                        transform: translateX(18px) rotate(40deg) rotateZ(0deg);
                    }
                    50% {
                        transform: translateX(-20px) rotate(-25deg) rotateZ(25deg);
                    }
                    100% {
                        transform: translateX(18px) rotate(40deg) rotateZ(0deg);
                    }
                }
            `}</style>
        </div>
    );
};

