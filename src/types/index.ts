export type Category = '재미' | '맛집' | '재테크' | '건강' | '게임' | '꿀팁' | '영상' | '여행';

export const CATEGORIES: Category[] = ['재미', '맛집', '재테크', '건강', '게임', '꿀팁', '영상', '여행'];

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  link_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'ignored';
  created_at: string;
  links?: Link;
  reporter?: User;
}

export interface Link {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string | null;
  site_name: string | null;
  category: Category;
  comment: string;
  like_count: number;
  save_count: number;
  is_hidden: boolean;
  created_at: string;
  users?: User;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface OgData {
  title: string;
  description: string;
  thumbnail: string | null;
  site_name: string | null;
}
