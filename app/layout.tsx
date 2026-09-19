import type { Metadata } from "next";
import { 
  Noto_Sans_JP, 
  Noto_Serif_JP, 
  Outfit, 
  Arbutus_Slab, 
  Akaya_Kanadaka 
} from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  weight: ['400', '700', '900'],
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const arbutusSlab = Arbutus_Slab({
  weight: '400',
  variable: "--font-arbutus-slab",
  subsets: ["latin"],
});

const akayaKanadaka = Akaya_Kanadaka({
  weight: '400',
  variable: "--font-akaya",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiiro - Learn Kana",
  description: "Learn Hiragana and Katakana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} ${outfit.variable} ${arbutusSlab.variable} ${akayaKanadaka.variable} font-sans antialiased bg-app-bg text-slate-800 min-h-screen relative`}
      >
        {/* Anti-Scale Overlay Warning */}
        <div className="hidden [@media(max-width:1500px)]:flex [@media(max-height:900px)]:flex fixed inset-0 z-[9999] bg-[#FFE8E0] text-[#543323] flex-col items-center justify-center p-8 text-center">
            <h1 className="text-[40px] font-arbutus tracking-tight mb-4">Skala Layar Terlalu Besar</h1>
            <p className="text-xl max-w-2xl font-sans leading-relaxed">
                Situs ini tidak didukung dalam ukuran atau skala layar ini. Silahkan mengecilkan skala browser (Zoom Out) dengan menekan <br/><br/>
                <span className="inline-block px-4 py-2 bg-white rounded-md border-2 border-[#E89A81] shadow-sm font-bold text-2xl tracking-widest">CTRL <span className="mx-2 font-normal text-lg">+</span> -</span>
            </p>
        </div>

        {children}
      </body>
    </html>
  );
}
