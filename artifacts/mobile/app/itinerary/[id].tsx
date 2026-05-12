import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpandableSummary } from '@/components/ExpandableSummary';
import { PictureGallery } from '@/components/PictureGallery';
import { PricingSection } from '@/components/PricingSection';
import { ReviewBar } from '@/components/ReviewBar';
import { ReadOnlyStopCard } from '@/components/StopCard';
import { useAuth } from '@/context/AuthContext';
import { useItineraries } from '@/context/ItineraryContext';
import { useColors } from '@/hooks/useColors';
import { CATEGORY_META } from '@/utils/categories';

export default function ItineraryDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItinerary, voteItinerary, deleteItinerary } = useItineraries();
  const { provider } = useAuth();

  const itinerary = getItinerary(id);
  const isOwner = !!provider && !!itinerary && itinerary.providerId === provider.id;

  if (!itinerary) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Itinerary not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleVote(vote: 'up' | 'down') {
    await voteItinerary(itinerary!.id, vote);
  }

  async function handleDelete() {
    Alert.alert('Delete Itinerary', 'Are you sure you want to delete this itinerary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteItinerary(itinerary!.id);
          router.back();
        },
      },
    ]);
  }

  function handleEdit() {
    router.push({ pathname: '/create', params: { editId: itinerary!.id } });
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const hasHeroPic = itinerary.pictures.length > 0;

  // Find provider name for badge
  const ownerBadge = isOwner ? 'You' : undefined;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {hasHeroPic ? (
        <View style={styles.heroContainer}>
          <Image source={{ uri: itinerary.pictures[0] }} style={styles.hero} contentFit="cover" />
          <View style={[styles.heroOverlay, { paddingTop: topPad + 8 }]}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            {isOwner && (
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.navBtn} onPress={handleEdit} activeOpacity={0.8}>
                  <Feather name="edit-2" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={handleDelete} activeOpacity={0.8}>
                  <Feather name="trash-2" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={[styles.noHeroBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={() => router.back()} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          {isOwner && (
            <View style={styles.heroActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={handleEdit} activeOpacity={0.8}>
                <Feather name="edit-2" size={18} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={handleDelete} activeOpacity={0.8}>
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <View style={styles.titleTopRow}>
            <Text style={[styles.idBadge, { color: colors.mutedForeground }]}>#{itinerary.id.slice(-6).toUpperCase()}</Text>
            {isOwner ? (
              <View style={[styles.ownerBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '44' }]}>
                <Feather name="shield" size={11} color={colors.primary} />
                <Text style={[styles.ownerBadgeText, { color: colors.primary }]}>Your listing</Text>
              </View>
            ) : (
              <View style={[styles.ownerBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="user" size={11} color={colors.mutedForeground} />
                <Text style={[styles.ownerBadgeText, { color: colors.mutedForeground }]}>View only</Text>
              </View>
            )}
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{itinerary.title}</Text>
          {(itinerary.categories ?? []).length > 0 && (
            <View style={styles.categoryRow}>
              {(itinerary.categories ?? []).map(cat => {
                const meta = CATEGORY_META[cat];
                return (
                  <View key={cat} style={[styles.catBadge, { backgroundColor: meta.bg, borderColor: meta.color + '55' }]}>
                    <Feather name={meta.icon as any} size={12} color={meta.color} />
                    <Text style={[styles.catText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <ExpandableSummary summary={itinerary.summary} details={itinerary.details} />

        {itinerary.pictures.length > 0 && (
          <PictureGallery pictures={itinerary.pictures} />
        )}

        <ReviewBar
          thumbsUp={itinerary.thumbsUp}
          thumbsDown={itinerary.thumbsDown}
          userVote={itinerary.userVote}
          onVote={handleVote}
        />

        {itinerary.segments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              Itinerary · {itinerary.segments.length} Stop{itinerary.segments.length !== 1 ? 's' : ''}
            </Text>
            {itinerary.segments.map((seg, i) => (
              <ReadOnlyStopCard
                key={seg.stop.id}
                segment={seg}
                index={i}
                isLast={i === itinerary.segments.length - 1}
              />
            ))}
          </View>
        )}

        <PricingSection
          basePrice={itinerary.basePrice}
          addOns={itinerary.addOns}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heroContainer: { position: 'relative', height: 260 },
  hero: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  noHeroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: { flexDirection: 'row', gap: 8 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14 },
  titleBlock: { gap: 5 },
  titleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idBadge: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  ownerBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    lineHeight: 32,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  back: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
