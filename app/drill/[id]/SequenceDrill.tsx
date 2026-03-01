"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana'; // Import interface yang tadi kita buat

interface SequenceDrillProps {
    groupChars: CharItem[];
}

const SequenceDrill: React.FC<SequenceDrillProps> = ({ groupChars }) => {
    // --- FUNGSI HELPER UNTUK GENERATE SOAL ---
    // Kita buat fungsi murni (pure function) untuk membuat data soal baru
    const createNewQuestionData = useCallback((chars: CharItem[]) => {
        const shuffled = [...chars].sort(() => 0.5 - Math.random());
        return {
            newSequence: shuffled.slice(0, 3),
            newOptions: [...chars].sort(() => 0.5 - Math.random()),
        };
    }, []);

    // --- INITIAL STATE ---
    // Kita langsung panggil helper di sini supaya render pertama sudah punya soal
    const [initialData] = useState(() => createNewQuestionData(groupChars));

    const [sequence, setSequence] = useState<CharItem[]>(initialData.newSequence);
    const [options, setOptions] = useState<CharItem[]>(initialData.newOptions);

    const [displayIndex, setDisplayIndex] = useState<number>(0);
    const [isDisplaying, setIsDisplaying] = useState<boolean>(true);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("Perhatikan urutannya...");
    const [questionCount, setQuestionCount] = useState<number>(1);
    const [isFinished, setIsFinished] = useState<boolean>(false);

    // --- LOGIKA START NEW QUESTION ---
    // Sekarang fungsi ini hanya dipakai untuk pindah ke soal berikutnya (handleChoice)
    const startNextQuestion = useCallback(() => {
        const { newSequence, newOptions } = createNewQuestionData(groupChars);
        setSequence(newSequence);
        setOptions(newOptions);
        setUserInput([]);
        setIsDisplaying(true);
        setDisplayIndex(0);
        setMessage("Perhatikan...");
    }, [groupChars, createNewQuestionData]);

    // --- LOGIKA TIMER (SUDAH DIPERBAIKI) ---
    useEffect(() => {
        if (!isDisplaying) return;

        const timer = setTimeout(() => {
            if (displayIndex < 2) {
                setDisplayIndex(prev => prev + 1);
            } else {
                // Pindah ke mode memilih langsung di dalam timer
                setIsDisplaying(false);
                setMessage("Pilih sesuai urutan!");
                setDisplayIndex(3);
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [displayIndex, isDisplaying]);

    // 3. LOGIKA KLIK JAWABAN
    const handleChoice = (romaji: string) => {
        if (isDisplaying) return;

        const currentIndex = userInput.length;
        if (romaji !== sequence[currentIndex].r) {
            alert("Urutan salah! Coba lagi.");
            startNextQuestion(); // Panggil fungsi next question
            return;
        }

        const nextInput = [...userInput, romaji];
        setUserInput(nextInput);

        if (nextInput.length === 3) {
            if (questionCount < 10) {
                setQuestionCount(prev => prev + 1);
                setTimeout(startNextQuestion, 800);
            } else {
                setIsFinished(true);
            }
        }
    };

    // LAYAR HASIL AKHIR
    if (isFinished) {
        return (
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center border-4 border-blue-50">
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-4xl font-black mb-4 text-slate-800 tracking-tight">Luar Biasa!</h2>
                <p className="text-slate-500 mb-10 leading-relaxed">
                    Kamu sudah menyelesaikan 10 tantangan memori urutan dengan sempurna.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                    Main Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* INDIKATOR SOAL */}
            <div className="mb-8 flex flex-col items-center space-y-3">
                <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
                    Tantangan {questionCount} / 10
                </span>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{message}</p>
            </div>

            {/* AREA UTAMA (DISPLAY BOX) */}
            <div className="w-full aspect-square bg-white border-4 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] flex items-center justify-center mb-12 transition-all relative overflow-hidden group">
                {/* Dekorasi background halus */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-transparent opacity-50"></div>

                {isDisplaying && displayIndex < 3 ? (
                    <span className="text-[10rem] font-black text-slate-900 animate-pulse relative z-10">
                        {sequence[displayIndex]?.k}
                    </span>
                ) : (
                    <div className="flex space-x-4 relative z-10">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-20 h-24 border-4 border-dashed rounded-2xl flex items-center justify-center text-3xl font-black transition-all
                  ${userInput[i]
                                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                                        : 'border-slate-100 bg-slate-50/50 text-transparent'
                                    }`}
                            >
                                {userInput[i] || ""}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* GRID PILIHAN ROMAJI */}
            <div className="grid grid-cols-5 gap-4 w-full px-2">
                {options.map((item) => (
                    <button
                        key={item.r}
                        disabled={isDisplaying || userInput.includes(item.r)}
                        onClick={() => handleChoice(item.r)}
                        className={`aspect-2/3 rounded-2xl font-black text-2xl transition-all duration-300
              ${isDisplaying
                                ? 'bg-slate-50 text-slate-100 border-transparent'
                                : 'bg-white border-2 border-slate-100 text-slate-800 hover:border-blue-500 hover:shadow-xl active:scale-90 shadow-sm'}
              ${userInput.includes(item.r) ? 'opacity-0 scale-75' : ''}
            `}
                    >
                        {item.r}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SequenceDrill;