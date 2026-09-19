"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const MainMenu: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-app-bg p-6 font-sans text-slate-800 flex flex-col overflow-hidden">
            {/* HEADER */}
            <header className="max-w-4xl mx-auto text-center mb-16 pt-10 text-[#5C3A21]">
                <h1 className="text-6xl mb-4 tracking-tight font-arbutus">
                    Hiiro
                </h1>
                <p className="opacity-80 font-medium font-akaya text-3xl">Pilih sistem penulisan yang ingin kamu pelajari hari ini</p>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center space-y-6 sm:space-y-0 sm:flex-row sm:space-x-12">
                {/* Hiragana Card */}
                <button
                    onClick={() => router.push('/select/hiragana')}
                    className="flex-1 bg-[#DF7956] text-[#FFEFE8] p-12 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all duration-300 group flex flex-col items-center justify-center relative overflow-hidden active:scale-95"
                >
                    <span className="text-9xl font-black mb-8 group-hover:scale-110 transition-transform duration-300 font-serif">あ</span>
                    <h2 className="text-4xl tracking-tight font-arbutus">Hiragana</h2>
                    <p className="mt-4 font-medium opacity-90 font-outfit text-xl">Huruf Jepang dasar</p>
                </button>

                {/* Katakana Card */}
                <button
                    onClick={() => router.push('/select/katakana')}
                    className="flex-1 bg-gradient-to-br from-[#F07B55] to-[#FFE8E0] text-[#6F3E28] p-12 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all duration-300 group flex flex-col items-center justify-center relative overflow-hidden active:scale-95"
                >
                    <span className="text-9xl font-black mb-8 group-hover:scale-110 transition-transform duration-300 font-serif">ア</span>
                    <h2 className="text-4xl tracking-tight font-arbutus">Katakana</h2>
                    <p className="mt-4 font-medium opacity-90 font-outfit text-xl">Untuk kata serapan asing</p>
                </button>
            </main>

            <footer className="text-center py-12 text-[#5C3A21]/50 text-sm font-bold tracking-widest uppercase mt-auto font-outfit">
                © 2026 Hiiro Studio
            </footer>
        </div>
    );
};

export default MainMenu;