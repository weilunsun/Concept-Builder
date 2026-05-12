import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PictureGallery } from '@/components/PictureGallery';
import { PricingSection } from '@/components/PricingSection';
import { EditableStopCard } from '@/components/StopCard';
import { useItineraries } from '@/context/ItineraryContext';
import { useColors } from '@/hooks/useColors';
import { AddOn, Itinerary, ItinerarySegment, Transit } from '@/types/itinerary';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function blankSegment(): ItinerarySegment {
  return {
    stop: { id: genId(), type: 'sightseeing', name: '', duration: 60, notes: '' },
  };
}

function blankTransit(): Transit {
  return { id: genId(), mode: 'driving', duration: 30, notes: '' };
}

export default function CreateScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { addItinerary, updateItinerary, getItinerary } = useItineraries();

  const isEdit = !!editId;
  const existing = editId ? getItinerary(editId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [summary, setSummary] = useState(existing?.summary ?? '');
  const [details, setDetails] = useState(existing?.details ?? '');
  const [pictures, setPictures] = useState<string[]>(existing?.pictures ?? []);
  const [segments, setSegments] = useState<ItinerarySegment[]>(
    existing?.segments.length ? existing.segments : [blankSegment()]
  );
  const [basePrice, setBasePrice] = useState(existing?.basePrice ?? 0);
  const [addOns, setAddOns] = useState<AddOn[]>(existing?.addOns ?? []);
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  function updateSegment(index: number, updated: ItinerarySegment) {
    setSegments(prev => prev.map((s, i) => i === index ? updated : s));
  }

  function removeSegment(index: number) {
    if (segments.length === 1) {
      Alert.alert('Cannot remove', 'An itinerary must have at least one stop.');
      return;
    }
    setSegments(prev => prev.filter((_, i) => i !== index));
  }

  function addSegment() {
    const newSeg = blankSegment();
    setSegments(prev => {
      const copy = [...prev];
      if (copy.length > 0 && !copy[copy.length - 1].transitAfter) {
        copy[copy.length - 1] = { ...copy[copy.length - 1], transitAfter: blankTransit() };
      }
      return [...copy, newSeg];
    });
  }

  function addTransitAfter(index: number) {
    setSegments(prev => prev.map((s, i) => i === index ? { ...s, transitAfter: blankTransit() } : s));
  }

  function removeTransitAfter(index: number) {
    setSegments(prev => prev.map((s, i) => i === index ? { ...s, transitAfter: undefined } : s));
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your itinerary.');
      return;
    }
    if (!summary.trim()) {
      Alert.alert('Summary required', 'Please enter a short summary.');
      return;
    }

    setSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const data = { title: title.trim(), summary: summary.trim(), details: details.trim(), pictures, segments, basePrice, addOns };

    try {
      if (isEdit && editId) {
        await updateItinerary(editId, data);
      } else {
        await addItinerary(data);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEdit ? 'Edit Itinerary' : 'New Itinerary'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saving ? colors.muted : colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: saving ? colors.mutedForeground : '#fff' }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Basic Info</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Title</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Tokyo Weekend Escape"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="next"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Summary</Text>
              <TextInput
                style={[styles.input, styles.multiline, { borderColor: colors.border, color: colors.foreground }]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Short description shown on the card"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Details</Text>
              <TextInput
                style={[styles.input, styles.multiline, { borderColor: colors.border, color: colors.foreground }]}
                value={details}
                onChangeText={setDetails}
                placeholder="Full description (expandable in detail view)"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={5}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Photos</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 14 }]}>
            <PictureGallery pictures={pictures} editable onChange={setPictures} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Stops & Transit · {segments.length} stop{segments.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.stopsContainer}>
            {segments.map((seg, i) => (
              <EditableStopCard
                key={seg.stop.id}
                segment={seg}
                index={i}
                isLast={i === segments.length - 1}
                onUpdate={updated => updateSegment(i, updated)}
                onRemove={() => removeSegment(i)}
                onAddTransit={() => addTransitAfter(i)}
                onRemoveTransit={() => removeTransitAfter(i)}
              />
            ))}
            <TouchableOpacity
              style={[styles.addStopBtn, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
              onPress={addSegment}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text style={[styles.addStopText, { color: colors.primary }]}>Add Stop</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Pricing</Text>
          <PricingSection
            basePrice={basePrice}
            addOns={addOns}
            editable
            onBaseChange={setBasePrice}
            onAddOnsChange={setAddOns}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  field: {
    padding: 14,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
  },
  stopsContainer: {
    gap: 10,
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addStopText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
