export interface GameData {
  title: string;
  category: string;
  image: string;
  videos: string[];
  description: string;
  steps: string[];
  specs: { label: string; value: string }[];
  screenshots: string[];
  downloads: { name: string; url: string; color?: string; icon?: string }[];
}

export interface Game {
  id: string;
  slug: string;
  data: GameData;
  created_at: string;
  views?: number;
  downloads?: number;
  rating_avg?: number;
  rating_count?: number;
}
