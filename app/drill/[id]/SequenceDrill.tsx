"use client";
import React, { useState, useEffect } from 'react';

// --- KOMPONEN GAME (SequenceDrill) ---
// Kita terima prop { groupChars } di sini
const SequenceDrill = ({ groupChars }) => {
  const [sequence, setSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [userInput, setUserInput] = useState([]);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("Perhatikan urutannya...");
  const [questionCount, setQuestionCount] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  const startNewQuestion = () => {
    // Acak 3 huruf unik dari grup
    const shuffled = [...groupChars].sort(() => 0.5 - Math.random());
    const newSeq = shuffled.slice(0, 3); 
    
    setSequence(newSeq);
    setUserInput([]);
    setIsDisplaying(true);
    setDisplayIndex(0);
    setMessage("Perhatikan...");
    
    // Acak pilihan jawaban (romaji)
    setOptions([...groupChars].sort(() => 0.5 - Math.random()));
  };

  useEffect(() => {
    if (isDisplaying && displayIndex >= 0 && displayIndex < 3) {
      const timer = setTimeout(() => {
        setDisplayIndex(displayIndex + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (displayIndex === 3) {
      setIsDisplaying(false);
      setMessage("Pilih sesuai urutan!");
    }
  }, [displayIndex, isDisplaying]);

  useEffect(() => {
    startNewQuestion();
  }, [groupChars]); // Re-run kalau groupChars berubah

  const handleChoice = (romaji) => {
    if (isDisplaying) return;
    
    const currentIndex = userInput.length;
    // Cek apakah pilihan (r) sama dengan urutan di sequence
    if (romaji !== sequence[currentIndex].r) {
      alert("Urutan salah! Coba lagi.");
      startNewQuestion();
      return;
    }

    const nextInput = [...userInput, romaji];
    setUserInput(nextInput);

    if (nextInput.length === 3) {
      if (questionCount < 10) {
        setQuestionCount(prev => prev + 1);
        setTimeout(startNewQuestion, 500);
      } else {
        setIsFinished(true);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-2 border-blue-100">
        <h2 className="text-3xl font-black mb-4 text-slate-800">Selesai! 🎉</h2>
        <p className="text-slate-500 mb-8">Kamu hebat sudah menyelesaikan 10 tantangan memori!</p>
        <button 
           onClick={() => window.location.reload()} 
           className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200"
        >
          Main Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center space-x-2">
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          Soal {questionCount} / 10
        </span>
      </div>

      <p className="text-slate-400 mb-4 font-bold text-sm uppercase tracking-wider">{message}</p>

      {/* AREA TAMPIL HURUF */}
      <div className="w-full aspect-square bg-white border-4 border-white shadow-2xl shadow-blue-100 rounded-[2.5rem] flex items-center justify-center mb-10 transition-all">
        {isDisplaying && displayIndex < 3 ? (
          <span className="text-9xl font-black text-slate-800 animate-pulse">
            {sequence[displayIndex]?.k}
          </span>
        ) : (
          <div className="flex space-x-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-16 h-20 border-4 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 bg-slate-50/50">
                {userInput[i] || ""}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOMBOL PILIHAN */}
      <div className="grid grid-cols-5 gap-3 w-full">
        {options.map((item) => (
          <button
            key={item.r}
            disabled={isDisplaying || userInput.includes(item.r)}
            onClick={() => handleChoice(item.r)}
            className={`aspect-[3/4] rounded-2xl font-black text-xl transition-all duration-200
              ${isDisplaying 
                ? 'bg-slate-100 text-slate-200' 
                : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-blue-500 hover:shadow-lg active:scale-95'}
              ${userInput.includes(item.r) ? 'opacity-20 grayscale' : 'shadow-sm'}
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