import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TripStatus, UserTrip } from '@/types/userTrip';

const STORAGE_KEY = '@user_trips_v1';

function genId() {
  return 'ut-' + Date.now().toString() + Math.random().toString(36).substr(2, 6);
}

interface UserTripsContextType {
  savedTrips: UserTrip[];
  bookedTrips: UserTrip[];
  isSaved: (itineraryId: string) => boolean;
  isBooked: (itineraryId: string) => boolean;
  toggleSave: (itineraryId: string) => Promise<void>;
  bookTrip: (itineraryId: string) => Promise<void>;
  cancelBooking: (itineraryId: string) => Promise<void>;
  loading: boolean;
}

const UserTripsContext = createContext<UserTripsContextType | undefined>(undefined);

export function UserTripsProvider({ children }: { children: ReactNode }) {
  const { provider } = useAuth();
  const [allTrips, setAllTrips] = useState<UserTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setAllTrips(raw ? JSON.parse(raw) : []);
      } catch {
        setAllTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(trips: UserTrip[]) {
    setAllTrips(trips);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }

  const myTrips = provider ? allTrips.filter(t => t.accountId === provider.id) : [];
  const savedTrips = myTrips.filter(t => t.status === 'saved');
  const bookedTrips = myTrips.filter(t => t.status === 'booked');

  function isSaved(itineraryId: string) {
    return myTrips.some(t => t.itineraryId === itineraryId && t.status === 'saved');
  }

  function isBooked(itineraryId: string) {
    return myTrips.some(t => t.itineraryId === itineraryId && t.status === 'booked');
  }

  async function toggleSave(itineraryId: string) {
    if (!provider) return;
    const existing = myTrips.find(t => t.itineraryId === itineraryId);
    if (existing) {
      // Remove saved or do nothing if booked
      if (existing.status === 'saved') {
        await persist(allTrips.filter(t => t.id !== existing.id));
      }
    } else {
      const newTrip: UserTrip = {
        id: genId(),
        itineraryId,
        accountId: provider.id,
        status: 'saved',
        createdAt: Date.now(),
      };
      await persist([...allTrips, newTrip]);
    }
  }

  async function bookTrip(itineraryId: string) {
    if (!provider) return;
    const existing = myTrips.find(t => t.itineraryId === itineraryId);
    if (existing) {
      // Upgrade saved → booked, or already booked
      await persist(allTrips.map(t =>
        t.id === existing.id ? { ...t, status: 'booked' as TripStatus, createdAt: Date.now() } : t,
      ));
    } else {
      const newTrip: UserTrip = {
        id: genId(),
        itineraryId,
        accountId: provider.id,
        status: 'booked',
        createdAt: Date.now(),
      };
      await persist([...allTrips, newTrip]);
    }
  }

  async function cancelBooking(itineraryId: string) {
    if (!provider) return;
    const existing = myTrips.find(t => t.itineraryId === itineraryId && t.status === 'booked');
    if (existing) {
      await persist(allTrips.filter(t => t.id !== existing.id));
    }
  }

  return (
    <UserTripsContext.Provider value={{
      savedTrips, bookedTrips, isSaved, isBooked,
      toggleSave, bookTrip, cancelBooking, loading,
    }}>
      {children}
    </UserTripsContext.Provider>
  );
}

export function useUserTrips() {
  const ctx = useContext(UserTripsContext);
  if (!ctx) throw new Error('useUserTrips must be used within UserTripsProvider');
  return ctx;
}
