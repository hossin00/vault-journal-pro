export type Mood = 'amazing' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  date: string; // ISO date string
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  isUnlocked: boolean;
  hasPassword: boolean;
  entries: JournalEntry[];
  theme: 'dark' | 'light';
}

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string }> = {
  amazing: { emoji: '🤩', label: 'Amazing', color: '#10b981' },
  good: { emoji: '😊', label: 'Good', color: '#3b82f6' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#64748b' },
  bad: { emoji: '😔', label: 'Bad', color: '#f59e0b' },
  terrible: { emoji: '😢', label: 'Terrible', color: '#ef4444' },
};
