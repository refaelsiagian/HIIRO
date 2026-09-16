"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const MainMenu: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 flex flex-col">
            {/* HEADER */}
            <header className="max-w-4xl mx-auto text-center mb-16 pt-10">
                <h1 className="text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">
                    Kana<span className="text-blue-600">Drill</span>
                </h1>
                <p className="text-slate-500 font-medium">Pilih sistem penulisan yang ingin kamu pelajari hari ini</p>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center space-y-6 sm:space-y-0 sm:flex-row sm:space-x-8">
                {/* Hiragana Card */}
                <button
                    onClick={() => router.push('/select/hiragana')}
                    className="flex-1 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/50 border-2 border-slate-100 hover:border-blue-300 transition-all duration-300 group flex flex-col items-center justify-center relative overflow-hidden active:scale-95"
                >
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <span className="text-8xl font-black text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">あ</span>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hiragana</h2>
                    <p className="text-slate-500 mt-2 font-medium">Huruf Jepang dasar</p>
                </button>

                {/* Katakana Card */}
                <button
                    onClick={() => router.push('/select/katakana')}
                    className="flex-1 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-red-200/50 border-2 border-slate-100 hover:border-red-300 transition-all duration-300 group flex flex-col items-center justify-center relative overflow-hidden active:scale-95"
                >
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                    <span className="text-8xl font-black text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">ア</span>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Katakana</h2>
                    <p className="text-slate-500 mt-2 font-medium">Untuk kata serapan asing</p>
                </button>
            </main>

            <footer className="text-center py-12 text-slate-300 text-xs font-bold tracking-widest uppercase mt-auto">
                © 2026 KanaDrill Studio
            </footer>
        </div>
    );
};

export default MainMenu;