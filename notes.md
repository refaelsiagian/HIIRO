Ran search daishiken in app/data
Analyzed daishiken.ts:L1-19
Ran search daishiken in app/
Analyzing page.tsx:L75-130
Ran list files in app/select
Analyzed page.tsx:L75-120
Analyzed page.tsx:L1-100
Ran check types.json for daishiken · Exited with code 1
Analyzed types.json:L1-50
Analyzed types.json:L51-126

Ide ini **sangat bagus dan menyegarkan (*game-changing*)** untuk HIIRO! 

Saat ini, setelah pemain menyelesaikan Daishiken (mendapatkan 3 bintang), tidak ada alasan lagi untuk kembali bermain karena kuisnya statis (punya target skor tetap lalu selesai). Menambahkan mode **Marathon / Endless** memberikan *replayability* tanpa batas dan sensasi *arcade high-score chasing*.

Berikut analisis, saran penamaan, dan masukan desain mekaniknya:

---

### 1. Saran Judul untuk Daishiken Saat Ini (Bukan "Basic")
Karena 4 kuis Daishiken saat ini (*The Other One, Wordbuilder, Under Guidance, Textbuilder*) adalah puncak ujian pemahaman dan deduksi tingkat tinggi, menyebutnya *"Basic"* memang akan terasa merendahkan nilainya.

Beberapa opsi nama yang terkesan prestisius dan pas dengan nuansa Jepang:

| Opsi | Nama (Romaji + Kanji) | Nuansa / Arti | Alasan Cocok |
| :--- | :--- | :--- | :--- |
| **A (Paling Direkomendasikan)** | **Honshiken (本試験)** | *Main / Official Examination* | Istilah resmi di Jepang untuk "Ujian Utama/Ujian Negara" (lawan dari latihan bebas). Sangat formal dan prestisius. |
| **B** | **Kentei (検定試験)** | *Proficiency / Certification* | Seperti *JLPT* (*Nihongo Nōryoku Shiken*) atau *Kanji Kentei*. Mengesankan sertifikasi kompetensi. |
| **C** | **Shiren (試練)** | *The Grand Trial / Ordeal* | Memberi kesan petualangan dan ujian puncak yang mendalam. |
| **D** | **Mastery (熟達 - Jukutatsu)** | *Mastery / Kematangan* | Menegaskan bahwa ini adalah pembuktian penguasaan penuh seluruh huruf. |

---

### 2. Saran Judul untuk Bagian Kedua (Endless / Marathon)

Untuk bagian kedua yang bertempo cepat dan tanpa batas:
- **Mugen (無限)** $\rightarrow$ *Endless / Infinite*: Sangat khas anime/game Jepang (*Mugen Mode*).
- **Rensō (連走 - Marathon / Continuous Run)**: Berlari tanpa henti menyambung kuis demi kuis.
- **Gekisō (激走 - Rush / Sprint)**: Jika konsepnya memacu kecepatan melawan waktu.
- **Survival (サバイバル - Sabaibaru)**: Bertahan hidup selama mungkin sampai nyawa/waktu habis.

> **Pasangan yang Sangat Serasi:**
> - Bagian 1: **Daishiken: Honshiken (大試験・本試験)** *(Ujian Kurikulum 4 Kuis)*
> - Bagian 2: **Daishiken: Mugen (大試験・無限)** *(Tantangan Marathon Tak Terbatas)*

---

### 3. Masukan Desain Mekanik untuk Mode Marathon (Shotesto Quizzes)

Konsep menggunakan kuis-kuis **Shotesto** (*True/False, Sequence, Find & Fill, Fill & Trace, Flip It, Quick Glance*) untuk mode ini adalah pilihan tepat karena ritmenya cepat dan bergaya arcade.

Beberapa hal menarik yang perlu dipertimbangkan untuk mekaniknya:

1. **Sistem Waktu (*Timer Economy*)**:
   - **Opsi A (Classic Arcade / Time-Attack)**: Timer awal misal 60 detik. Setiap jawaban benar menambah waktu (+2 atau +3 detik). Pemain yang cepat dan tepat bisa bertahan sangat lama.
   - **Opsi B (Fixed Master Timer)**: Diberi waktu tetap (misal 3 menit penuh) + 3 nyawa. Targetnya mengumpulkan poin sebanyak mungkin sebelum waktu/nyawa habis.
2. **Rotasi Kuis (*WarioWare / Medley Style*)**:
   - Apakah dalam 1 sesi permainannya berganti-ganti mini-game (misal: 5 soal True/False $\rightarrow$ 1 gelombang Flip It $\rightarrow$ 5 soal Find & Fill $\rightarrow$ Quick Glance)? 
   - Pergantian kuis yang dinamis akan membuat pemain tidak cepat bosan dan adrenalin tetap tinggi!
3. **Cakupan Huruf (*Character Pool*)**:
   - Karena ini di Daishiken, bank soal bisa mengambil dari **seluruh huruf Hiragana/Katakana** yang ada (Gojūon, Dakuon, Yōon, Tokushuon), menjadikannya ujian refleks terlengkap.
4. **Penentuan Bintang & High Score**:
   - Bintang ditentukan berdasarkan ambang batas skor, misal:
     - 🌟 **1 Bintang**: 25 Poin
     - 🌟🌟 **2 Bintang**: 50 Poin
     - 🌟🌟🌟 **3 Bintang**: 100 Poin
   - Kita juga bisa menyimpan **Personal Best (High Score)** pemain di `localStorage` / Zustand store agar mereka selalu tertantang memecahkan rekornya sendiri.

Bagaimana menurut Anda mengenai pasangan nama **Honshiken** & **Mugen**, serta sistem rotasi kuisnya?