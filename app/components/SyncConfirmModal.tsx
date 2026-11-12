"use client";

import React, { useState } from 'react';

interface SyncConfirmModalProps {
    isOpen: boolean;
    onSync: () => Promise<void>;
    onStartAnew: () => Promise<void> | void;
}

export const SyncConfirmModal: React.FC<SyncConfirmModalProps> = ({
    isOpen,
    onSync,
    onStartAnew,
}) => {
    const [isSyncing, setIsSyncing] = useState(false);

    if (!isOpen) return null;

    const handleConfirmSync = async () => {
        setIsSyncing(true);
        try {
            await onSync();
        } finally {
            setIsSyncing(false);
        }
    };

    const handleConfirmStartAnew = async () => {
        setIsSyncing(true);
        try {
            await onStartAnew();
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadein">
            <div className="w-full max-w-md bg-[#FFF5F2] border-2 border-[#DF7956]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-[#5C3A21] relative animate-popup">
                
                {/* Decorative Icon or Badge */}
                <div className="w-14 h-14 bg-[#DF7956]/15 text-[#DF7956] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>

                <h3 className="font-arbutus text-2xl font-bold mb-3 text-center tracking-tight">
                    Pindahkan Progres?
                </h3>

                <p className="font-outfit text-sm sm:text-base opacity-85 text-center leading-relaxed mb-6">
                    Kamu memiliki progres belajar yang tersimpan di perangkat ini. Apakah kamu ingin memindahkannya ke akun Google ini atau memulai dari awal?
                </p>

                <div className="bg-white/60 border border-[#DF7956]/20 rounded-2xl p-3.5 mb-6 text-xs font-outfit text-[#5C3A21]/80 text-center leading-relaxed">
                    💡 <strong>Pindahkan ke Akun:</strong> Menyimpan progres saat ini ke Cloud akun Google kamu.<br />
                    💡 <strong>Mulai dari Awal:</strong> Akun Google ini mulai dari 0, dan progres tamumu tetap aman tersimpan saat kamu logout.
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={handleConfirmSync}
                        disabled={isSyncing}
                        className="w-full py-3.5 px-6 rounded-2xl bg-[#DF7956] hover:bg-[#c96645] text-white font-arbutus text-base sm:text-lg font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isSyncing ? "Memindahkan..." : "Pindahkan ke Akun"}
                    </button>

                    <button
                        onClick={handleConfirmStartAnew}
                        disabled={isSyncing}
                        className="w-full py-2.5 px-6 rounded-2xl bg-white/70 hover:bg-white text-[#5C3A21]/70 hover:text-[#5C3A21] border border-[#DF7956]/30 font-outfit text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isSyncing ? "Menyiapkan..." : "Mulai dari Awal untuk Akun Ini"}
                    </button>
                </div>
            </div>
        </div>
    );
};

