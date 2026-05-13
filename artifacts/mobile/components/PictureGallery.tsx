import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Use base64 data URI so images survive reloads and AsyncStorage serialization
      const uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      onChange?.([...pictures, uri]);
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {pictures.map((uri, i) => (
          <View key={i} style={styles.thumb}>
            <Image
              source={{ uri }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
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
            <Feather name="camera" size={20} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>
              {pictures.length === 0 ? 'Add Photo' : 'Add'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
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
    width: 120,
    height: 90,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  addText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});
