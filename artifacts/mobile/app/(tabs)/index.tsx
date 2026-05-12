import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveFilters, FilterChips } from '@/components/FilterChips';
import { ItineraryCard } from '@/components/ItineraryCard';
import { SearchBar } from '@/components/SearchBar';
import { useItineraries } from '@/context/ItineraryContext';
import { useColors } from '@/hooks/useColors';
import { Itinerary } from '@/types/itinerary';

const DEFAULT_FILTERS: ActiveFilters = { stopTypes: [], categories: [], sort: 'newest' };

function totalPrice(it: Itinerary) {
  return it.basePrice + it.addOns.reduce((s, a) => s + a.price, 0);
}

function applyFiltersAndSort(list: Itinerary[], query: string, filters: ActiveFilters): Itinerary[] {
  let result = [...list];

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      it =>
        it.title.toLowerCase().includes(q) ||
        it.summary.toLowerCase().includes(q) ||
        it.details.toLowerCase().includes(q),
    );
  }

  if (filters.categories.length > 0) {
    result = result.filter(it =>
      filters.categories.some(cat => (it.categories ?? []).includes(cat)),
    );
  }

  if (filters.stopTypes.length > 0) {
    result = result.filter(it =>
      filters.stopTypes.every(type => it.segments.some(seg => seg.stop.type === type)),
    );
  }

  switch (filters.sort) {
    case 'newest':    result.sort((a, b) => b.createdAt - a.createdAt); break;
    case 'oldest':    result.sort((a, b) => a.createdAt - b.createdAt); break;
    case 'price_asc': result.sort((a, b) => totalPrice(a) - totalPrice(b)); break;
    case 'price_desc':result.sort((a, b) => totalPrice(b) - totalPrice(a)); break;
    case 'most_liked':result.sort((a, b) => b.thumbsUp - a.thumbsUp); break;
  }

  return result;
}

export default function ItineraryListScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itineraries, loading } = useItineraries();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => applyFiltersAndSort(itineraries, query, filters),
    [itineraries, query, filters],
  );

  const isFiltering =
    query.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.stopTypes.length > 0 ||
    filters.sort !== 'newest';

  async function handleCreate() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.heading, { color: colors.foreground }]}>Itineraries</Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            {itineraries.length} trip{itineraries.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchArea, { borderBottomColor: colors.border }]}>
        <View style={styles.searchBarWrapper}>
          <SearchBar value={query} onChange={setQuery} />
        </View>
        <FilterChips filters={filters} onChange={setFilters} resultCount={filtered.length} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name={isFiltering ? 'search' : 'map'} size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {isFiltering ? 'No matches found' : 'No itineraries yet'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {isFiltering
              ? 'Try adjusting your search or removing filters'
              : 'Tap the + button to create your first trip'}
          </Text>
          {isFiltering && (
            <TouchableOpacity
              style={[styles.clearBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => { setQuery(''); setFilters(DEFAULT_FILTERS); }}
              activeOpacity={0.8}
            >
              <Feather name="x" size={14} color={colors.primary} />
              <Text style={[styles.clearBtnText, { color: colors.primary }]}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={it => it.id}
          renderItem={({ item }) => (
            <ItineraryCard itinerary={item} onPress={() => router.push(`/itinerary/${item.id}`)} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  heading: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  searchArea: {
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  list: {
    padding: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
