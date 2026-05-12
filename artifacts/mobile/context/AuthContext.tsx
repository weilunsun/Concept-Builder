import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Provider } from '@/types/provider';

const PROVIDERS_KEY = '@providers_v1';
const SESSION_KEY = '@session_v1';

function genId() {
  return 'prov-' + Date.now().toString() + Math.random().toString(36).substr(2, 6);
}

const SEED_PROVIDERS: Provider[] = [
  { id: 'prov-001', name: 'Coastal Adventures', email: 'coastal@demo.com', password: 'demo123', createdAt: Date.now() - 86400000 * 10 },
  { id: 'prov-002', name: 'Euro Travel Co',     email: 'euro@demo.com',    password: 'demo123', createdAt: Date.now() - 86400000 * 5 },
];

interface AuthContextType {
  provider: Provider | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  allProviders: Provider[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedProviders = await AsyncStorage.getItem(PROVIDERS_KEY);
        const providers: Provider[] = storedProviders ? JSON.parse(storedProviders) : SEED_PROVIDERS;
        if (!storedProviders) await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(SEED_PROVIDERS));
        setAllProviders(providers);

        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          const { providerId } = JSON.parse(session);
          const found = providers.find(p => p.id === providerId);
          if (found) setProvider(found);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string): Promise<{ error?: string }> {
    const storedRaw = await AsyncStorage.getItem(PROVIDERS_KEY);
    const providers: Provider[] = storedRaw ? JSON.parse(storedRaw) : SEED_PROVIDERS;
    const found = providers.find(p => p.email.toLowerCase() === email.trim().toLowerCase() && p.password === password);
    if (!found) return { error: 'Invalid email or password.' };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ providerId: found.id }));
    setAllProviders(providers);
    setProvider(found);
    return {};
  }

  async function register(name: string, email: string, password: string): Promise<{ error?: string }> {
    const storedRaw = await AsyncStorage.getItem(PROVIDERS_KEY);
    const providers: Provider[] = storedRaw ? JSON.parse(storedRaw) : SEED_PROVIDERS;
    if (providers.find(p => p.email.toLowerCase() === email.trim().toLowerCase())) {
      return { error: 'An account with this email already exists.' };
    }
    const newProvider: Provider = { id: genId(), name: name.trim(), email: email.trim().toLowerCase(), password, createdAt: Date.now() };
    const updated = [...providers, newProvider];
    await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ providerId: newProvider.id }));
    setAllProviders(updated);
    setProvider(newProvider);
    return {};
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setProvider(null);
  }

  return (
    <AuthContext.Provider value={{ provider, loading, login, register, logout, allProviders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
