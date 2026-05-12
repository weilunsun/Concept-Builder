import { Category } from '@/types/itinerary';

export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string; bg: string }> = {
  photography: { label: 'Photography', icon: 'aperture', color: '#8B5CF6', bg: '#F5F3FF' },
  experience:  { label: 'Experience',  icon: 'zap',      color: '#F97316', bg: '#FFF7ED' },
  sight:       { label: 'Sight',       icon: 'eye',      color: '#0EA5E9', bg: '#F0F9FF' },
};

export const ALL_CATEGORIES: Category[] = ['photography', 'experience', 'sight'];
