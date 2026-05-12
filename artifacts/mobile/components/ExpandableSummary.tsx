import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  summary: string;
  details: string;
}

export function ExpandableSummary({ summary, details }: Props) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.summary, { color: colors.foreground }]}>{summary}</Text>
      {expanded && (
        <Text style={[styles.details, { color: colors.mutedForeground }]}>{details}</Text>
      )}
      {details.length > 0 && (
        <TouchableOpacity style={styles.toggle} onPress={toggle} activeOpacity={0.7}>
          <Text style={[styles.toggleText, { color: colors.primary }]}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  summary: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  details: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
