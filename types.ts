export interface DailyBriefing {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  coverImage: string;
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