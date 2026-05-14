import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItineraries } from '@/context/ItineraryContext';
import { useUserTrips } from '@/context/UserTripsContext';
import { useColors } from '@/hooks/useColors';
import { Itinerary } from '@/types/itinerary';
import { UserTrip } from '@/types/userTrip';

type Tab = 'saved' | 'booked';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function totalPrice(it: Itinerary) {
  return it.basePrice + it.addOns.reduce((s, a) => s + a.price, 0);
}

function TripCard({
  trip,
  itinerary,
  tab,
  onPress,
  onRemove,
}: {
  trip: UserTrip;
  itinerary: Itinerary;
  tab: Tab;
  onPress: () => void;
  onRemove: () => void;
}) {
  const colors = useColors();
  const hasPic = itinerary.pictures.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: colors.secondary }]}>
        {hasPic ? (
          <Image source={{ uri: itinerary.pictures[0] }} style={styles.thumbImg} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <Feather name="map" size={24} color={colors.primary} />
        )}
        {/* Status pill */}
        <View style={[
          styles.statusPill,
          { backgroundColor: tab === 'booked' ? colors.primary : colors.accent ?? '#F4845F' },
        ]}>
          <Feather name={tab === 'booked' ? 'check-circle' : 'bookmark'} size={10} color="#fff" />
          <Text style={styles.statusPillText}>{tab === 'booked' ? 'Booked' : 'Saved'}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
          {itinerary.title}
        </Text>
        <Text style={[styles.cardSummary, { color: colors.mutedForeground }]} numberOfLines={2}>
          {itinerary.summary}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>
            ${totalPrice(itinerary).toLocaleString()}
          </Text>
          <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
            {tab === 'booked' ? 'Booked' : 'Saved'} {formatDate(trip.createdAt)}
          </Text>
        </View>
      </View>

      {/* Remove */}
      <TouchableOpacity
        style={[styles.removeBtn, { backgroundColor: colors.muted }]}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Feather name="x" size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MyTripsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getItinerary } = useItineraries();
  const { savedTrips, bookedTrips, toggleSave, cancelBooking } = useUserTrips();
  const [tab, setTab] = useState<Tab>('booked');

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const trips = tab === 'saved' ? savedTrips : bookedTrips;

  async function handleRemoveSaved(itineraryId: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleSave(itineraryId);
  }

  function handleRemoveBooked(itineraryId: string) {
    Alert.alert(
      'Cancel Booking',
      'Remove this trip from your bookings?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await cancelBooking(itineraryId);
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Trips</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(['booked', 'saved'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, t === tab && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Feather
              name={t === 'booked' ? 'check-circle' : 'bookmark'}
              size={15}
              color={t === tab ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: t === tab ? colors.primary : colors.mutedForeground }]}>
              {t === 'booked' ? 'Booked' : 'Saved'}
            </Text>
            {(t === 'booked' ? bookedTrips : savedTrips).length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: t === tab ? colors.primary : colors.muted }]}>
                <Text style={[styles.tabBadgeText, { color: t === tab ? '#fff' : colors.mutedForeground }]}>
                  {(t === 'booked' ? bookedTrips : savedTrips).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {trips.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name={tab === 'booked' ? 'check-circle' : 'bookmark'} size={34} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {tab === 'booked' ? 'No bookings yet' : 'No saved trips'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {tab === 'booked'
              ? 'Book a trip from the itinerary detail screen'
              : 'Save trips you want to come back to later'}
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.browseBtnText}>Browse Itineraries</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={t => t.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const itinerary = getItinerary(item.itineraryId);
            if (!itinerary) return null;
            return (
              <TripCard
                trip={item}
                itinerary={itinerary}
                tab={tab}
                onPress={() => router.push(`/itinerary/${itinerary.id}`)}
                onRemove={() =>
                  tab === 'saved'
                    ? handleRemoveSaved(item.itineraryId)
                    : handleRemoveBooked(item.itineraryId)
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumb: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%' },
  statusPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  info: { flex: 1, padding: 12, gap: 4 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  cardSummary: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cardPrice: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  cardDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  browseBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  browseBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
