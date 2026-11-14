Ran search for scale in app/
Analyzed layout.tsx:L1-70

Ini rencana yang sangat bagus! Namun, ada beberapa **faktor krusial (concerns)** yang harus diperhatikan agar rencanamu berjalan mulus tanpa merusak pengalaman pengguna di HP maupun di Desktop.

---

### 1. Masalah Utama pada Kode Saat Ini di `layout.tsx`
Saat ini di [app/layout.tsx](file:///c:/Users/ACER/Documents/Projects/HIIRO/app/layout.tsx#L58), overlay anti-scale ditulis murni menggunakan CSS media query:
```tsx
<div className="hidden [@media(max-width:1500px)]:flex [@media(max-height:900px)]:flex ...">
    <h1>Skala Layar Terlalu Besar</h1>
</div>
```
* **Konsekuensinya:** Lebar layar smartphone modern rata-rata adalah **360px – 430px**.
* Karena CSS hanya memeriksa `max-width: 1500px`, **semua HP otomatis terblokir** oleh pesan *"Skala Layar Terlalu Besar"*.

---

### 2. Lima Hal Krusial yang Perlu Diperhatikan (Concerns):

#### A. Membedakan "Desktop Zoomed-In" vs "HP Fisik"
CSS media query saja **tidak bisa** membedakan antara:
* Laptop yang browsernya di-zoom in 150% (lebar viewport jadi 1280px)
* Smartphone fisik (lebar viewport 390px)

> [!IMPORTANT]
> **Solusinya:** Alert anti-scale harus dikondisikan: **HANYA aktif jika terdeteksi sebagai Desktop**.
> Jika terdeteksi sebagai HP (`isMobile`), overlay ini harus diabaikan/dinonaktifkan sepenuhnya.

---

#### B. Dimensi Komponen Saat Ini Masih Bersifat "Desktop-First" (Fixed Width)
Banyak komponen yang saat ini dirancang untuk layar lebar dengan ukuran piksel statis atau aspect ratio landscape:
* **Halaman Stage:** Menggunakan split-screen 5:7, di mana kartu stage memiliki lebar tetap **707px** (`w-[707px]`), font kanji raksasa (`text-[280px]`), dan dialog popup `aspect-[1.8/1]`.
* **Minigame / Drill:**
  * `QuickGlanceDrill`: Menggunakan grid **9 kolom** (di layar HP 390px, setiap kolom kartu akan sangat sempit jika tidak diubah jadi 4-5 kolom).
  * `FindFillDrill`: Menampilkan **5 pilar vertikal** berdampingan (lebar total ~600px+ yang akan meluber ke luar layar HP).
* **Solusinya:** Perlu penyesuaian CSS responsive (Tailwind breakpoints `sm:` / `md:` / `lg:`) pada halaman-halaman tersebut agar elemen bisa wrap atau stack secara vertikal di layar sempit.

---

#### C. Orientasi Layar (Portrait vs Landscape)
Game drill HIIRO banyak menggunakan komposisi melebar (horizontal / landscape).
* Di HP, pengguna 90% memegang ponsel secara tegak (**Portrait**).
* **Keputusan Desain:**
  * Apakah kamu ingin membuat tampilan **Portrait khusus HP** (konten disusun ke bawah)?
  * Atau di HP tetap landscape dan menampilkan instruksi *"Mohon putar ponsel ke mode Landscape"*?

---

#### D. Touch / Gesture Issues di HP
Pada drill berkecepatan tinggi (seperti *True/False* atau *Flip It*):
* **Double-tap to Zoom:** Saat pemain men-tap tombol jawaban berkali-kali dengan cepat, browser HP (Chrome/Safari) secara default akan menganggapnya double-tap dan melakukan zoom halaman otomatis.
  * *Solusi:* Perlu menambahkan CSS `touch-action: manipulation;` pada tombol drill.
* **Hover State yang "Menempel":** Style seperti `hover:scale-105` di HP akan tetap menempel setelah layar ditap sampai user men-tap tempat lain.

---

#### E. SSR / Hydration di Next.js (Mencegah Kedipan Layar)
Karena Next.js me-render HTML awal di server:
* Server tidak tahu ukuran layar browser klien sampai halaman selesai dimuat di perangkat.
* Jika deteksi dilakukan tanpa penanganan client-side yang tepat, pengguna desktop bisa melihat kedipan alert muncul sebentar lalu hilang, atau sebaliknya di HP.
* *Solusi:* Komponen overlay peringatan harus diisolasi sebagai Client Component (`'use client'`) dengan state mounted, atau menggunakan User-Agent di Next.js Middleware.

---

### Rekomendasi Solusi untuk Overlay:
Kita bisa mengubah overlay di `layout.tsx` menjadi komponen client pintar, contohnya:
```tsx
'use client';
import { useDevice } from '@/hooks/useDevice';

export function ScreenScaleWarning() {
  const { isDesktop } = useDevice();

  // Jika HP, jangan pernah tampilkan peringatan ini!
  if (!isDesktop) return null;

  return (
    <div className="hidden [@media(max-width:1500px)]:flex [@media(max-height:900px)]:flex fixed inset-0 z-[9999] ...">
       ...
    </div>
  );
}
```

Dengan cara ini:
1. **Desktop:** Tetap terlindungi dari skala browser yang terlalu besar (tetap muncul peringatan Ctrl + -).
2. **Mobile:** Langsung lolos masuk ke aplikasi tanpa terhalang alert tersebut.