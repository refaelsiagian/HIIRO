"use client"

import React, { useState, useEffect } from 'react';

import HIRAGANA_DATA from './hiragana.json';

interface HiraganaItem {
  char: string;
  romaji: string;
  group: string;
}

interface Question {
  word: string;
  answer: string;
  options: string[];
}

const JapaneseDrill = () => {
  const [currentGroup, setCurrentGroup] = useState("a-gyo");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // --- LOGIKA GENERATOR SOAL ---

  interface DistributionConfig {
    len: number;
    count: number;
  }

  const generateOptions = (correct: string): string[] => {
    // Logika mengambil 'confusable_with' dari karakter terakhir atau acak
    const choices: string[] = [correct];
    while (choices.length < 4) {
      const fake = correct.replace(/[aeiou]/g, ["a","i","u","e","o"][Math.floor(Math.random()*5)]);
      if (!choices.includes(fake)) choices.push(fake);
    }
    return choices.sort(() => Math.random() - 0.5);
  };

  // --- HANDLERS ---
  const handleAnswer = (choice: string): void => {
    if (selectedAnswer) return; // Mencegah klik ganda
    
    setSelectedAnswer(choice);
    const correct: boolean = choice === questions[currentIndex].answer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const createSingleWord = (length: number, groupPool: HiraganaItem[], fullPool: HiraganaItem[]): Question => {
    const wordChars: string[] = [];
    let correctRomaji: string = "";

    for (let i = 0; i < length; i++) {
      // Suku kata pertama wajib dari groupPool (yang lagi dipelajari)
      // Suku kata sisanya acak dari fullPool agar natural
      const pool = (i === 0) ? groupPool : fullPool;
      let charObj: HiraganaItem = pool[Math.floor(Math.random() * pool.length)];

      // Aturan "Natural": Index 0 gaboleh 'ん', gaboleh vokal kembar beruntun
      if (i === 0 && charObj.char === "ん") {
         charObj = groupPool.find(c => c.char !== "ん") || groupPool[0];
      }

      wordChars.push(charObj.char);
      correctRomaji += charObj.romaji;
    }

    return {
      word: wordChars.join(''),
      answer: correctRomaji,
      options: generateOptions(correctRomaji)
    };
  };

  
  // Start Exam
  useEffect(() => {
    const generateQuestions = (groupName: string): Question[] => {
      const groupPool: HiraganaItem[] = HIRAGANA_DATA.filter(item => item.group === groupName);
      const fullPool: HiraganaItem[] = HIRAGANA_DATA;

      const newQuestions: Question[] = [];
      
      const distribution: DistributionConfig[] = [
        { len: 1, count: 3 }, { len: 2, count: 7 }, 
        { len: 3, count: 4 }, { len: 4, count: 3 }, { len: 5, count: 3 }
      ];

      distribution.forEach(d => {
        for (let i = 0; i < d.count; i++) {
          newQuestions.push(createSingleWord(d.len, groupPool, fullPool));
        }
      });

      return newQuestions.sort(() => Math.random() - 0.5);
    };

    const newQuestions = generateQuestions(currentGroup);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);
  }, [currentGroup]);
  
  if (questions.length === 0) return <div>Loading...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans">
      {/* Header & Progress */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-xl font-bold text-gray-700 text-center mb-2">Drill: {currentGroup.toUpperCase()}</h2>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-right text-sm text-gray-500 mt-1">{currentIndex + 1} / {questions.length}</p>
      </div>

      {/* Main Card */}
      {!showResult ? (
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
          <div className="text-7xl mb-12 font-bold text-gray-800 tracking-widest py-10 bg-gray-50 rounded-xl">
            {currentQ.word}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className={`py-4 rounded-xl font-semibold text-lg transition-all border-2 
                  ${selectedAnswer === opt 
                    ? (isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white')
                    : 'bg-white border-gray-200 hover:border-blue-400 text-gray-700'
                  }
                  ${selectedAnswer && opt === currentQ.answer && !isCorrect ? 'border-green-500 text-green-600' : ''}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">Selesai! 🎉</h2>
          <p className="text-5xl font-bold text-blue-600 mb-6">{Math.round((score/questions.length)*100)}</p>
          <p className="text-gray-600 mb-8">Kamu berhasil menjawab {score} dari {questions.length} soal.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Ulangi Grup Ini
          </button>
        </div>
      )}
    </div>
  );
};

export default JapaneseDrill;