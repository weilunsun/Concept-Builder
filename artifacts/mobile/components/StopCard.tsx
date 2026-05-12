import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { ItinerarySegment, Stop, StopType, Transit, TransitMode } from '@/types/itinerary';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const STOP_ICONS: Record<StopType, string> = { food: 'coffee', sightseeing: 'camera', business: 'briefcase' };
const TRANSIT_ICONS: Record<TransitMode, string> = { walking: 'navigation', driving: 'truck', transit: 'map', flight: 'send' };

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

interface ReadOnlyStopCardProps {
  segment: ItinerarySegment;
  index: number;
  isLast: boolean;
}

export function ReadOnlyStopCard({ segment, index, isLast }: ReadOnlyStopCardProps) {
  const colors = useColors();
  const { stop, transitAfter } = segment;
  const color = stopColor(stop.type, colors);
  const bg = stopBg(stop.type, colors);
  const icon = STOP_ICONS[stop.type] as any;

  return (
    <View>
      <View style={[styles.stopRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconBubble, { backgroundColor: bg }]}>
          <Feather name={icon} size={16} color={color} />
        </View>
        <View style={styles.stopBody}>
          <View style={styles.stopTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: bg }]}>
              <Text style={[styles.typeText, { color }]}>{stop.type}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Feather name="clock" size={10} color={colors.mutedForeground} />
              <Text style={[styles.durationText, { color: colors.mutedForeground }]}>{stop.duration}m</Text>
            </View>
          </View>
          <Text style={[styles.stopName, { color: colors.foreground }]}>{stop.name}</Text>
          {stop.notes.length > 0 && (
            <Text style={[styles.stopNotes, { color: colors.mutedForeground }]}>{stop.notes}</Text>
          )}
        </View>
      </View>

      {transitAfter && !isLast && (
        <View style={styles.transitRow}>
          <View style={[styles.transitLine, { backgroundColor: colors.border }]} />
          <View style={[styles.transitChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name={TRANSIT_ICONS[transitAfter.mode] as any} size={12} color={colors.mutedForeground} />
            <Text style={[styles.transitText, { color: colors.mutedForeground }]}>
              {transitAfter.mode} · {transitAfter.duration}m
            </Text>
          </View>
          <View style={[styles.transitLine, { backgroundColor: colors.border }]} />
        </View>
      )}
    </View>
  );
}

interface EditableStopCardProps {
  segment: ItinerarySegment;
  index: number;
  isLast: boolean;
  onUpdate: (updated: ItinerarySegment) => void;
  onRemove: () => void;
  onAddTransit: () => void;
  onRemoveTransit: () => void;
}

const STOP_TYPES: StopType[] = ['food', 'sightseeing', 'business'];
const TRANSIT_MODES: TransitMode[] = ['walking', 'driving', 'transit', 'flight'];

export function EditableStopCard({ segment, index, isLast, onUpdate, onRemove, onAddTransit, onRemoveTransit }: EditableStopCardProps) {
  const colors = useColors();
  const { stop, transitAfter } = segment;
  const color = stopColor(stop.type, colors);

  function updateStop(updates: Partial<Stop>) {
    onUpdate({ ...segment, stop: { ...stop, ...updates } });
  }

  function updateTransit(updates: Partial<Transit>) {
    if (!transitAfter) return;
    onUpdate({ ...segment, transitAfter: { ...transitAfter, ...updates } });
  }

  async function handleRemove() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove();
  }

  return (
    <View style={styles.editableWrapper}>
      <View style={[styles.editableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.editHeader}>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>Stop {index + 1}</Text>
          <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="trash-2" size={15} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        <View style={styles.typeRow}>
          {STOP_TYPES.map(t => {
            const selected = stop.type === t;
            const tc = stopColor(t, colors);
            const tbg = stopBg(t, colors);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, { backgroundColor: selected ? tc : tbg, borderColor: tc }]}
                onPress={() => updateStop({ type: t })}
                activeOpacity={0.8}
              >
                <Feather name={STOP_ICONS[t] as any} size={12} color={selected ? '#fff' : tc} />
                <Text style={[styles.typeChipText, { color: selected ? '#fff' : tc }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          value={stop.name}
          onChangeText={v => updateStop({ name: v })}
          placeholder="Stop name"
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="next"
        />

        <View style={styles.durationRow}>
          <Feather name="clock" size={14} color={colors.mutedForeground} />
          <TextInput
            style={[styles.durationInput, { borderColor: colors.border, color: colors.foreground }]}
            value={stop.duration > 0 ? String(stop.duration) : ''}
            onChangeText={v => updateStop({ duration: Number(v.replace(/[^0-9]/g, '')) || 0 })}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            returnKeyType="next"
          />
          <Text style={[styles.durationUnit, { color: colors.mutedForeground }]}>min</Text>
        </View>

        <TextInput
          style={[styles.input, styles.notesInput, { borderColor: colors.border, color: colors.foreground }]}
          value={stop.notes}
          onChangeText={v => updateStop({ notes: v })}
          placeholder="Notes (optional)"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={2}
        />
      </View>

      {!isLast && (
        transitAfter ? (
          <View style={[styles.transitEdit, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={styles.transitModeRow}>
              {TRANSIT_MODES.map(m => {
                const sel = transitAfter.mode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeChip, { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border }]}
                    onPress={() => updateTransit({ mode: m })}
                    activeOpacity={0.8}
                  >
                    <Feather name={TRANSIT_ICONS[m] as any} size={12} color={sel ? '#fff' : colors.mutedForeground} />
                    <Text style={[styles.modeText, { color: sel ? '#fff' : colors.mutedForeground }]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.durationRow}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[styles.durationInput, { borderColor: colors.border, color: colors.foreground }]}
                value={transitAfter.duration > 0 ? String(transitAfter.duration) : ''}
                onChangeText={v => updateTransit({ duration: Number(v.replace(/[^0-9]/g, '')) || 0 })}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <Text style={[styles.durationUnit, { color: colors.mutedForeground }]}>min transit</Text>
              <TouchableOpacity onPress={onRemoveTransit} style={styles.removeTransit}>
                <Feather name="x-circle" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, marginTop: 6 }]}
              value={transitAfter.notes}
              onChangeText={v => updateTransit({ notes: v })}
              placeholder="Transit notes (optional)"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        ) : (
          <TouchableOpacity style={[styles.addTransitBtn, { borderColor: colors.border }]} onPress={onAddTransit} activeOpacity={0.7}>
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={[styles.addTransitText, { color: colors.primary }]}>Add transit to next stop</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stopBody: {
    flex: 1,
    gap: 4,
  },
  stopTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'capitalize',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  stopName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  stopNotes: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 18,
    gap: 8,
  },
  transitLine: {
    flex: 1,
    height: 1,
  },
  transitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  transitText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textTransform: 'capitalize',
  },
  editableWrapper: {
    gap: 0,
  },
  editableCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    width: 70,
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  transitEdit: {
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginHorizontal: 16,
  },
  transitModeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
  },
  removeTransit: {
    marginLeft: 'auto',
  },
  addTransitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  addTransitText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
