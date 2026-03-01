"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import router
import KANA_METADATA from './data/kana_metadata.json';

const MainMenu = () => {
  const router = useRouter(); // Inisialisasi router
  // 1. Pastikan default state pakai huruf kecil sesuai kunci di JSON
  const [category, setCategory] = useState('hiragana');
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // 2. Ambil data secara dinamis. 
  // Kalau category berubah, currentData otomatis berubah.
  const currentData = KANA_METADATA[category];

  // Fungsi buka popup belajar
  const openStudyModal = (group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

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
            className={`px-8 py-2 rounded-lg font-bold transition ${category === 'hiragana'
                ? 'bg-white shadow text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Hiragana
          </button>

          {/* TOMBOL KATAKANA */}
          <button
            onClick={() => setCategory('katakana')} // Pakai huruf kecil
            className={`px-8 py-2 rounded-lg font-bold transition ${category === 'katakana'
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
                        {char.k}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-center font-bold text-slate-800">{group.title}</h3>


                  <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full">
                    <div className="bg-blue-400 h-full w-0 rounded-full"></div>
                  </div>
                  {/* TOMBOL BELAJAR */}
                  <button
                    onClick={() => openStudyModal(group)}
                    className="w-full mt-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Belajar
                  </button>
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

      {/* --- POPUP / MODAL BELAJAR --- */}
      {showModal && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header Modal */}
            <div className="p-6 text-center border-b border-slate-100">
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-1">{category}</p>
              <h2 className="text-2xl font-black text-slate-800">{selectedGroup.title}</h2>
            </div>

            {/* Isi Huruf & Romaji */}
            <div className="p-8">
              <div className="grid grid-cols-5 gap-3">
                {selectedGroup.chars.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-3xl font-bold text-slate-800 mb-1">{item.k}</span>
                    <span className="text-xs font-bold text-blue-500 uppercase">{item.r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Action */}
            <div className="p-6 bg-slate-50 flex flex-col space-y-3">
              <button
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                onClick={() => {
                  // PINDAH HALAMAN sambil bawa ID grup dan kategori
                  router.push(`/drill/${selectedGroup.id}?cat=${category}`);
                }}
              >
                Mulai Tes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition"
              >
                Nanti Dulu
              </button>
            </div>

          </div>
        </div>
      )}

      <footer className="text-center mt-20 text-slate-400 text-sm">
        KanaDrill - Latihan Hiragana & Katakana
      </footer>
    </div>
  );
};

export default MainMenu;