import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search itineraries…' }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x-circle" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
});
