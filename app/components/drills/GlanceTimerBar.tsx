'use client';

import React, { useEffect, useRef } from 'react';

interface GlanceTimerBarProps {
    durationMs: number;
    isActive: boolean;
    onTimeout: () => void;
    resetSignal?: number;
    className?: string;
}

/**
 * High-performance 60fps/120fps progress bar with smooth cubic ease-out rewinding.
 * Animates directly via DOM ref & requestAnimationFrame without triggering React re-renders.
 */
export const GlanceTimerBar: React.FC<GlanceTimerBarProps> = ({
    durationMs,
    isActive,
    onTimeout,
    resetSignal = 0,
    className = '',
}) => {
    const barRef = useRef<HTMLDivElement>(null);
    const durationMsRef = useRef<number>(durationMs);
    durationMsRef.current = durationMs;

    const timeLeftMsRef = useRef<number>(durationMs);
    const lastFrameTimeRef = useRef<number>(Date.now());
    const rafIdRef = useRef<number | null>(null);

    const modeRef = useRef<'running' | 'rewinding'>('running');
    const rewindStartTimeRef = useRef<number>(0);
    const rewindStartPercentRef = useRef<number>(0);
    const currentPercentRef = useRef<number>(0);

    const onTimeoutRef = useRef(onTimeout);
    onTimeoutRef.current = onTimeout;

    // Trigger rewind on external resetSignal changes (clicks / matches)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        modeRef.current = 'rewinding';
        rewindStartTimeRef.current = Date.now();
        rewindStartPercentRef.current = currentPercentRef.current;
    }, [resetSignal]);

    // Main animation frame loop
    useEffect(() => {
        if (!isActive) {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            return;
        }

        // Reset timer state on active start
        timeLeftMsRef.current = durationMs;
        lastFrameTimeRef.current = Date.now();
        modeRef.current = 'running';
        currentPercentRef.current = 0;
        if (barRef.current) barRef.current.style.width = '0%';

        const tick = () => {
            if (modeRef.current === 'rewinding') {
                const elapsed = Date.now() - rewindStartTimeRef.current;
                const p = Math.min(1, elapsed / 220); // 220ms smooth ease-out rewind
                const ease = 1 - Math.pow(1 - p, 3); // Cubic ease-out
                const currentWidth = Math.max(0, rewindStartPercentRef.current * (1 - ease));
                currentPercentRef.current = currentWidth;

                if (barRef.current) {
                    barRef.current.style.width = `${currentWidth}%`;
                }

                if (p >= 1) {
                    // Rewind completed: seamlessly resume forward progression
                    modeRef.current = 'running';
                    timeLeftMsRef.current = durationMsRef.current;
                    lastFrameTimeRef.current = Date.now();
                    currentPercentRef.current = 0;
                    if (barRef.current) {
                        barRef.current.style.width = '0%';
                    }
                }
            } else {
                const now = Date.now();
                const delta = now - lastFrameTimeRef.current;
                lastFrameTimeRef.current = now;

                timeLeftMsRef.current -= delta;

                if (timeLeftMsRef.current <= 0) {
                    // Time expired
                    onTimeoutRef.current();
                    // Retract smoothly back to 0%
                    modeRef.current = 'rewinding';
                    rewindStartTimeRef.current = Date.now();
                    rewindStartPercentRef.current = 100;
                } else {
                    const total = durationMsRef.current;
                    const percent = Math.min(100, Math.max(0, ((total - timeLeftMsRef.current) / total) * 100));
                    currentPercentRef.current = percent;
                    if (barRef.current) {
                        barRef.current.style.width = `${percent}%`;
                    }
                }
            }

            rafIdRef.current = requestAnimationFrame(tick);
        };

        rafIdRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [isActive, durationMs]);

    return (
        <div className={`w-full h-4 bg-white/40 rounded-full overflow-hidden border border-[#DF7956]/30 ${className}`}>
            <div
                ref={barRef}
                className="h-full bg-red-500 rounded-full"
                style={{ width: '0%' }}
            />
        </div>
    );
};

export default GlanceTimerBar;
