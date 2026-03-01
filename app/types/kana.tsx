// Gunakan 'export' supaya bisa di-import di file mana pun
export interface CharItem {
  k: string; // kana
  r: string; // romaji
}

export interface GroupData {
  id: string;
  title: string;
  chars: CharItem[];
}

export interface KanaMetadata {
  [category: string]: {
    [section: string]: GroupData[];
  };
}