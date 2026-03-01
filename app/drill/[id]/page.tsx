"use client";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import SequenceDrill from './SequenceDrill';
import KANA_METADATA from '../../data/kana_metadata.json';

// --- KOMPONEN UTAMA HALAMAN ---
export default function DrillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('cat') || 'hiragana';
  const groupId = params.id;

  const [groupData, setGroupData] = useState(null);

  useEffect(() => {
    const sections = KANA_METADATA[category];
    let found = null;
    
    Object.values(sections).forEach(section => {
      const g = section.find(item => item.id === groupId);
      if (g) found = g;
    });

    setGroupData(found);
  }, [groupId, category]);

  if (!groupData) return <div className="p-10 text-center font-bold">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header navigasi */}
      <div className="max-w-md mx-auto flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="font-bold text-slate-400 hover:text-slate-600 transition">
          ← Menu
        </button>
        <h1 className="text-xl font-black text-slate-800">{groupData.title}</h1>
        <div className="w-10"></div> {/* Spacer biar judul di tengah */}
      </div>

      <div className="max-w-md mx-auto">
        {/* DI SINI KITA PANGGIL GAME-NYA 
          Kita kirim groupData.chars ke dalam prop groupChars
        */}
        <SequenceDrill groupChars={groupData.chars} />
      </div>
    </div>
  );
}