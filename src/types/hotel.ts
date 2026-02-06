export type CategoryId = string;

export interface ScoreMap {
  [key: string]: number;
}

export interface DiaryEntry {
  text: string;
  images: string[];
}

export interface HotelData {
  id?: string;
  name: string;
  address: string;
  date: string;
  checkin: string;
  checkout: string;
  category: string;
  memo: string;
  url: string;
  price: string;
  lat: number | null;
  lon: number | null;
  scoresY: ScoreMap;
  scoresF: ScoreMap;
  sumY: number | string; // "未" の場合があるため
  sumF: number | string;
  totalScore: number;
  isDoneY: boolean;
  isDoneF: boolean;
  labelY: string;
  labelF: string;
  diaries: { [date: string]: DiaryEntry | string }; // 旧形式対応
  tags: string[];
  photos: string[];
  photo: string | null;
  isWishlist?: boolean;
  timestamp?: any;
}

export interface AppSettings {
  pass_y?: string;
  pass_f?: string;
  icon_y?: string;
  icon_f?: string;
  name_y?: string;
  name_f?: string;
}