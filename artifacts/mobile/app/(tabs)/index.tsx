import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
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
import { ItineraryCard } from '@/components/ItineraryCard';
import { useItineraries } from '@/context/ItineraryContext';
import { useColors } from '@/hooks/useColors';
import { Itinerary } from '@/types/itinerary';

export default function ItineraryListScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { itineraries, loading } = useItineraries();

  async function handleCreate() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  }

  function handleOpen(it: Itinerary) {
    router.push(`/itinerary/${it.id}`);
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : itineraries.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="map" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No itineraries yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Tap the + button to create your first trip
          </Text>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={it => it.id}
          renderItem={({ item }) => (
            <ItineraryCard itinerary={item} onPress={() => handleOpen(item)} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!itineraries.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  list: {
    padding: 16,
    paddingTop: 20,
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
});
