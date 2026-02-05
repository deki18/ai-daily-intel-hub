export type Category = 'politics' | 'economy' | 'technology';

export const CATEGORY_CONFIG: Record<Category, { labelZh: string; labelEn: string }> = {
  politics: { labelZh: '政治与军事', labelEn: 'Politics & Military' },
  economy: { labelZh: '经济', labelEn: 'Economy' },
  technology: { labelZh: '科技', labelEn: 'Technology' },
};

export interface DailyBriefing {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  coverImage: string;
  category: Category; // 所属板块
  audioUrl?: string; // Optional audio URL for list view playback
}

export interface BriefingDetail extends DailyBriefing {
  fullContent: string; // Markdown content
  audioUrl: string;
}

export enum AppView {
  LANDING = 'LANDING',
  LIST = 'LIST',
  DETAIL = 'DETAIL',
}

export interface IconProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}