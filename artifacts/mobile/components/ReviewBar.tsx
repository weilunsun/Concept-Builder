import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
  onVote: (vote: 'up' | 'down') => void;
}

export function ReviewBar({ thumbsUp, thumbsDown, userVote, onVote }: Props) {
  const colors = useColors();
  const total = thumbsUp + thumbsDown;
  const upPct = total > 0 ? thumbsUp / total : 0.5;

  async function handleVote(vote: 'up' | 'down') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVote(vote);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Community Reviews</Text>

      <View style={styles.bar}>
        <View style={[styles.barFill, { backgroundColor: colors.sightseeing ?? '#10B981', width: `${Math.round(upPct * 100)}%` as any }]} />
        <View style={[styles.barEmpty, { backgroundColor: colors.destructive + '33' }]} />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: userVote === 'up' ? colors.primary : colors.secondary, borderColor: userVote === 'up' ? colors.primary : colors.border },
          ]}
          onPress={() => handleVote('up')}
          activeOpacity={0.8}
        >
          <Feather name="thumbs-up" size={16} color={userVote === 'up' ? colors.primaryForeground : colors.primary} />
          <Text style={[styles.btnText, { color: userVote === 'up' ? colors.primaryForeground : colors.primary }]}>
            {thumbsUp}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: userVote === 'down' ? colors.destructive : colors.secondary, borderColor: userVote === 'down' ? colors.destructive : colors.border },
          ]}
          onPress={() => handleVote('down')}
          activeOpacity={0.8}
        >
          <Feather name="thumbs-down" size={16} color={userVote === 'down' ? '#fff' : colors.destructive} />
          <Text style={[styles.btnText, { color: userVote === 'down' ? '#fff' : colors.destructive }]}>
            {thumbsDown}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.pct, { color: colors.mutedForeground }]}>
          {Math.round(upPct * 100)}% positive
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barEmpty: {
    flex: 1,
    height: '100%',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  pct: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginLeft: 'auto',
  },
});
