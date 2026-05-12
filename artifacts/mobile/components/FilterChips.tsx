import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Category, StopType } from '@/types/itinerary';
import { ALL_CATEGORIES, CATEGORY_META } from '@/utils/categories';

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'most_liked';

export interface ActiveFilters {
  stopTypes: StopType[];
  categories: Category[];
  sort: SortOption;
}

const STOP_TYPES: { value: StopType; label: string; icon: string }[] = [
  { value: 'food', label: 'Food', icon: 'coffee' },
  { value: 'sightseeing', label: 'Sightseeing', icon: 'camera' },
  { value: 'business', label: 'Business', icon: 'briefcase' },
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Newest', icon: 'clock' },
  { value: 'oldest', label: 'Oldest', icon: 'clock' },
  { value: 'price_asc', label: 'Price ↑', icon: 'dollar-sign' },
  { value: 'price_desc', label: 'Price ↓', icon: 'dollar-sign' },
  { value: 'most_liked', label: 'Top Rated', icon: 'thumbs-up' },
];

function stopColor(type: StopType, colors: ReturnType<typeof useColors>): string {
  if (type === 'food') return colors.food ?? '#F59E0B';
  if (type === 'sightseeing') return colors.sightseeing ?? '#10B981';
  return colors.business ?? '#3B82F6';
}

function stopBg(type: StopType, colors: ReturnType<typeof useColors>): string {
  if (type === 'food') return colors.foodBg ?? '#FFFBEB';
  if (type === 'sightseeing') return colors.sightseeingBg ?? '#ECFDF5';
  return colors.businessBg ?? '#EFF6FF';
}

interface Props {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  resultCount: number;
}

export function FilterChips({ filters, onChange, resultCount }: Props) {
  const colors = useColors();

  async function toggleCategory(cat: Category) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const already = filters.categories.includes(cat);
    onChange({
      ...filters,
      categories: already
        ? filters.categories.filter(c => c !== cat)
        : [...filters.categories, cat],
    });
  }

  async function toggleStopType(type: StopType) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const already = filters.stopTypes.includes(type);
    onChange({
      ...filters,
      stopTypes: already
        ? filters.stopTypes.filter(t => t !== type)
        : [...filters.stopTypes, type],
    });
  }

  async function setSort(sort: SortOption) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...filters, sort });
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.stopTypes.length > 0 ||
    filters.sort !== 'newest';

  async function clearAll() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange({ categories: [], stopTypes: [], sort: 'newest' });
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '44' }]}
            onPress={clearAll}
            activeOpacity={0.75}
          >
            <Feather name="x" size={12} color={colors.destructive} />
            <Text style={[styles.chipText, { color: colors.destructive }]}>Clear</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {ALL_CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          const active = filters.categories.includes(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { backgroundColor: active ? meta.color : meta.bg, borderColor: active ? meta.color : meta.color + '55' },
              ]}
              onPress={() => toggleCategory(cat)}
              activeOpacity={0.75}
            >
              <Feather name={meta.icon as any} size={12} color={active ? '#fff' : meta.color} />
              <Text style={[styles.chipText, { color: active ? '#fff' : meta.color }]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {STOP_TYPES.map(({ value, label, icon }) => {
          const active = filters.stopTypes.includes(value);
          const color = stopColor(value, colors);
          const bg = stopBg(value, colors);
          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, { backgroundColor: active ? color : bg, borderColor: active ? color : color + '44' }]}
              onPress={() => toggleStopType(value)}
              activeOpacity={0.75}
            >
              <Feather name={icon as any} size={12} color={active ? '#fff' : color} />
              <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {SORT_OPTIONS.map(({ value, label, icon }) => {
          const active = filters.sort === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border },
              ]}
              onPress={() => setSort(value)}
              activeOpacity={0.75}
            >
              <Feather name={icon as any} size={12} color={active ? '#fff' : colors.mutedForeground} />
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.mutedForeground }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {hasActiveFilters && (
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  separator: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 20,
  },
});
