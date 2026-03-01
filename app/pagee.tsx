"use client";
import React, { useState, useEffect } from 'react';

// kana_db.json (Contoh isinya)
const groupChars = [
  { "char": "か", "romaji": "ka", "group": "k-gyo" },
  { "char": "き", "romaji": "ki", "group": "k-gyo" },
  { "char": "く", "romaji": "ku", "group": "k-gyo" },
  { "char": "け", "romaji": "ke", "group": "k-gyo" },
  { "char": "こ", "romaji": "ko", "group": "k-gyo" }
]

const SequenceDrill = () => {
  // groupChars isinya contoh: [{char: "あ", romaji: "a"}, ...]
  const [sequence, setSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [userInput, setUserInput] = useState([]);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("Perhatikan urutannya...");

  // 1. MULAI SOAL: Acak 3 huruf dari grup
  const startNewQuestion = () => {
    const shuffled = [...groupChars].sort(() => 0.5 - Math.random());
    const newSeq = shuffled.slice(0, 3); // Ambil 3 huruf
    setSequence(newSeq);
    setUserInput([]);
    setIsDisplaying(true);
    setDisplayIndex(0);
    setMessage("Perhatikan...");
    
    // Acak pilihan jawaban (5 romaji)
    setOptions([...groupChars].sort(() => 0.5 - Math.random()));
  };

  // 2. LOGIKA MOUNCULIN HURUF BERGANTIAN
  useEffect(() => {
    if (isDisplaying && displayIndex >= 0 && displayIndex < 3) {
      const timer = setTimeout(() => {
        setDisplayIndex(displayIndex + 1);
      }, 1200); // Muncul tiap 1.2 detik
      return () => clearTimeout(timer);
    } else if (displayIndex === 3) {
      // Setelah huruf ke-3 selesai
      setIsDisplaying(false);
      setMessage("Pilih jawaban sesuai urutan!");
    }
  }, [displayIndex, isDisplaying]);

  useEffect(() => {
    startNewQuestion();
  }, []);

  // 3. LOGIKA KLIK JAWABAN
  const handleChoice = (romaji) => {
    if (isDisplaying) return;
    
    const nextInput = [...userInput, romaji];
    setUserInput(nextInput);

    // Cek apakah urutan yang diklik benar
    const currentIndex = userInput.length;
    if (romaji !== sequence[currentIndex].romaji) {
      alert("Salah urutan! Coba lagi.");
      startNewQuestion();
      return;
    }

    // Kalau sudah klik 3 dan benar semua
    if (nextInput.length === 3) {
      alert("Mantap! Benar semua.");
      startNewQuestion();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto">
      <p className="text-slate-500 mb-4 font-medium">{message}</p>

      {/* KOTAK BESAR TEMPAT HURUF TAMPIL */}
      <div className="w-64 h-64 bg-white border-4 border-blue-100 rounded-3xl shadow-inner flex items-center justify-center mb-10">
        {isDisplaying && displayIndex < 3 ? (
          <span className="text-8xl font-bold text-slate-800 animate-pulse">
            {sequence[displayIndex]?.char}
          </span>
        ) : (
          <div className="flex space-x-2">
            {/* Slot kosong untuk jawaban yang sudah dipilih */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-12 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xl font-bold text-blue-600">
                {userInput[i] || ""}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PILIHAN JAWABAN (5 ROMAJI) */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {options.map((item) => (
          <button
            key={item.romaji}
            disabled={isDisplaying || userInput.includes(item.romaji)}
            onClick={() => handleChoice(item.romaji)}
            className={`py-4 rounded-xl font-bold text-lg transition-all
              ${isDisplaying ? 'bg-slate-100 text-slate-300' : 'bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700 shadow-sm'}
              ${userInput.includes(item.romaji) ? 'opacity-30' : ''}
            `}
          >
            {item.romaji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SequenceDrill;