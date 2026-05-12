import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const MAX_PICTURES = 5;

interface Props {
  pictures: string[];
  editable?: boolean;
  onChange?: (pictures: string[]) => void;
}

export function PictureGallery({ pictures, editable = false, onChange }: Props) {
  const colors = useColors();

  async function pickImage() {
    if (pictures.length >= MAX_PICTURES) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      onChange?.([...pictures, result.assets[0].uri]);
    }
  }

  function removeImage(index: number) {
    onChange?.(pictures.filter((_, i) => i !== index));
  }

  if (!editable && pictures.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Photos {pictures.length}/{MAX_PICTURES}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {pictures.map((uri, i) => (
          <View key={i} style={styles.thumb}>
            <Image source={{ uri }} style={styles.image} contentFit="cover" />
            {editable && (
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: colors.destructive }]}
                onPress={() => removeImage(i)}
              >
                <Feather name="x" size={10} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {editable && pictures.length < MAX_PICTURES && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={22} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  scroll: {
    gap: 10,
    paddingRight: 4,
  },
  thumb: {
    width: 110,
    height: 82,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 80,
    height: 82,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});
