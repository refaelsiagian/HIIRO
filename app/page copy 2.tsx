"use client";

import React, { useState } from 'react';
import KANA_METADATA from './kana_metadata.json';

const MainMenu = () => {
  // 1. Pastikan default state pakai huruf kecil sesuai kunci di JSON
  const [category, setCategory] = useState('hiragana'); 

  // 2. Ambil data secara dinamis. 
  // Kalau category berubah, currentData otomatis berubah.
  const currentData = KANA_METADATA[category];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* HEADER & TOGGLE */}
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-6 text-slate-900">
          Kana<span className="text-blue-600">Drill</span>
        </h1>
        
        <div className="inline-flex bg-slate-200 p-1 rounded-xl shadow-inner">
          {/* TOMBOL HIRAGANA */}
          <button 
            onClick={() => setCategory('hiragana')} // Pakai huruf kecil
            className={`px-8 py-2 rounded-lg font-bold transition ${
              category === 'hiragana' 
              ? 'bg-white shadow text-blue-600' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Hiragana
          </button>

          {/* TOMBOL KATAKANA */}
          <button 
            onClick={() => setCategory('katakana')} // Pakai huruf kecil
            className={`px-8 py-2 rounded-lg font-bold transition ${
              category === 'katakana' 
              ? 'bg-white shadow text-blue-600' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Katakana
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto space-y-12">
        {/* currentData akan otomatis ganti isi pas category berubah */}
        {Object.entries(currentData).map(([sectionKey, groups]) => (
          <section key={sectionKey}>
            <h2 className="text-xl font-bold mb-4 ml-2 text-slate-600 border-l-4 border-blue-500 pl-3 capitalize">
              {sectionKey === 'basic' ? 'Bagian Dasar' : 
               sectionKey === 'dakuten' ? 'Dakuten & Handakuten' : 
               'Kombinasi & Spesial'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div 
                  key={group.id}
                  className="bg-white border-2 border-slate-100 p-5 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {group.id}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>

                  <div className="flex justify-center space-x-2 mb-6">
                    {group.chars.map((char, idx) => (
                      <span key={idx} className="text-2xl font-bold text-slate-700 group-hover:text-blue-600 transition">
                        {char}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-center font-bold text-slate-800">{group.title}</h3>
                  
                  <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full">
                    <div className="bg-blue-400 h-full w-0 rounded-full"></div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-600 p-5 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-200">
                <span className="text-sm font-bold opacity-80 uppercase">Final</span>
                <h3 className="text-lg font-black">GRAND TEST</h3>
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center mt-20 text-slate-400 text-sm">
        KanaDrill - Latihan Hiragana & Katakana
      </footer>
    </div>
  );
};

export default MainMenu;