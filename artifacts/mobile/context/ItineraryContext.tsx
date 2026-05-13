import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Itinerary } from '@/types/itinerary';

const STORAGE_KEY = '@itineraries_v4';

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const SAMPLES: Itinerary[] = [
  {
    id: 'it-001',
    providerId: 'prov-001',
    title: 'Coastal Road Trip',
    summary: 'A scenic drive along the California coast with stops at iconic landmarks and hidden coves.',
    details: 'This 3-day adventure takes you from San Francisco to Los Angeles along Highway 1. Experience dramatic cliff views, charming seaside towns, whale watching, and unforgettable Pacific sunsets. Best done in spring or fall to avoid crowds. Pack layers — coastal weather changes fast.',
    pictures: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    ],
    categories: ['photography', 'sight'],
    thumbsUp: 24,
    thumbsDown: 2,
    userVote: null,
    segments: [
      {
        stop: { id: 's1', type: 'sightseeing', name: 'Bixby Creek Bridge', duration: 45, notes: 'Stop at the overlook for best photos' },
        transitAfter: { id: 't1', mode: 'driving', duration: 30, notes: 'Continue south on Highway 1' },
      },
      {
        stop: { id: 's2', type: 'food', name: 'Nepenthe Restaurant', duration: 90, notes: 'Ambrosia burger is iconic — order it' },
        transitAfter: { id: 't2', mode: 'driving', duration: 20, notes: 'Into Big Sur village' },
      },
      {
        stop: { id: 's3', type: 'sightseeing', name: 'McWay Falls', duration: 60, notes: 'Waterfall drops directly onto beach — stunning' },
      },
    ],
    basePrice: 350,
    addOns: [
      { id: 'a1', name: 'Hotel Upgrade', price: 150 },
      { id: 'a2', name: 'Wine Tasting Tour', price: 65 },
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'it-002',
    providerId: 'prov-002',
    title: 'European City Break',
    summary: 'Five days exploring the highlights of Paris and Amsterdam with expert-curated stops.',
    details: 'A carefully crafted journey through two of Europe\'s most beloved cities. From the Eiffel Tower to the Anne Frank House, this itinerary balances iconic landmarks with local neighborhoods, exceptional cuisine, and cultural depth. Designed for first-timers and repeat visitors alike.',
    pictures: [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=800&q=80',
    ],
    categories: ['experience', 'sight'],
    thumbsUp: 41,
    thumbsDown: 5,
    userVote: 'up',
    segments: [
      {
        stop: { id: 's4', type: 'sightseeing', name: 'Eiffel Tower', duration: 120, notes: 'Book skip-the-line tickets in advance' },
        transitAfter: { id: 't3', mode: 'transit', duration: 25, notes: 'Metro Line 6 to Saint-Germain' },
      },
      {
        stop: { id: 's5', type: 'food', name: 'Le Marais Bistro', duration: 90, notes: 'Try the duck confit — award winning' },
        transitAfter: { id: 't4', mode: 'flight', duration: 75, notes: 'Direct CDG → AMS, no checked bags' },
      },
      {
        stop: { id: 's6', type: 'business', name: 'Rijksmuseum', duration: 180, notes: 'Rembrandt collection is on floor 2' },
      },
    ],
    basePrice: 1200,
    addOns: [
      { id: 'a3', name: 'Museum Pass', price: 85 },
      { id: 'a4', name: 'Canal River Cruise', price: 45 },
      { id: 'a5', name: 'Airport Transfer', price: 60 },
    ],
    createdAt: Date.now() - 86400000,
  },
];

interface ItineraryContextType {
  itineraries: Itinerary[];
  loading: boolean;
  addItinerary: (data: Omit<Itinerary, 'id' | 'createdAt' | 'thumbsUp' | 'thumbsDown' | 'userVote'>) => Promise<string>;
  updateItinerary: (id: string, updates: Partial<Itinerary>) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  voteItinerary: (id: string, vote: 'up' | 'down') => Promise<void>;
  getItinerary: (id: string) => Itinerary | undefined;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Itinerary[] = JSON.parse(stored);
          // Migrate any records missing providerId
          const migrated = parsed.map(it => ({ ...it, providerId: it.providerId ?? 'prov-001' }));
          setItineraries(migrated);
        } else {
          setItineraries(SAMPLES);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLES));
        }
      } catch {
        setItineraries(SAMPLES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(list: Itinerary[]) {
    setItineraries(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async function addItinerary(data: Omit<Itinerary, 'id' | 'createdAt' | 'thumbsUp' | 'thumbsDown' | 'userVote'>): Promise<string> {
    const id = genId();
    const newItem: Itinerary = { ...data, id, thumbsUp: 0, thumbsDown: 0, userVote: null, createdAt: Date.now() };
    await persist([newItem, ...itineraries]);
    return id;
  }

  async function updateItinerary(id: string, updates: Partial<Itinerary>) {
    await persist(itineraries.map(it => it.id === id ? { ...it, ...updates } : it));
  }

  async function deleteItinerary(id: string) {
    await persist(itineraries.filter(it => it.id !== id));
  }

  async function voteItinerary(id: string, vote: 'up' | 'down') {
    await persist(itineraries.map(it => {
      if (it.id !== id) return it;
      let { thumbsUp, thumbsDown, userVote } = it;
      if (userVote === 'up') thumbsUp = Math.max(0, thumbsUp - 1);
      if (userVote === 'down') thumbsDown = Math.max(0, thumbsDown - 1);
      if (userVote === vote) return { ...it, thumbsUp, thumbsDown, userVote: null };
      if (vote === 'up') thumbsUp += 1; else thumbsDown += 1;
      return { ...it, thumbsUp, thumbsDown, userVote: vote };
    }));
  }

  function getItinerary(id: string) {
    return itineraries.find(it => it.id === id);
  }

  return (
    <ItineraryContext.Provider value={{ itineraries, loading, addItinerary, updateItinerary, deleteItinerary, voteItinerary, getItinerary }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItineraries() {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItineraries must be used within ItineraryProvider');
  return ctx;
}
