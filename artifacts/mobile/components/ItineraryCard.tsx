import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Itinerary } from '@/types/itinerary';

interface Props {
  itinerary: Itinerary;
  onPress: () => void;
}

function formatDuration(segments: Itinerary['segments']): string {
  const total = segments.reduce((acc, seg) => {
    acc += seg.stop.duration;
    if (seg.transitAfter) acc += seg.transitAfter.duration;
    return acc;
  }, 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function totalPrice(it: Itinerary): number {
  return it.basePrice + it.addOns.reduce((s, a) => s + a.price, 0);
}

export function ItineraryCard({ itinerary, onPress }: Props) {
  const colors = useColors();
  const hasPic = itinerary.pictures.length > 0;
  const stops = itinerary.segments.length;
  const total = totalPrice(itinerary);
  const duration = formatDuration(itinerary.segments);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {hasPic ? (
        <Image source={{ uri: itinerary.pictures[0] }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
          <Feather name="map" size={32} color={colors.primary} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{itinerary.title}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>${total.toLocaleString()}</Text>
        </View>

        <Text style={[styles.summary, { color: colors.mutedForeground }]} numberOfLines={2}>
          {itinerary.summary}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{stops} stop{stops !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{duration}</Text>
          </View>
          <View style={styles.meta}>
            <Feather name="thumbs-up" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{itinerary.thumbsUp}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  summary: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
