import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AddOn } from '@/types/itinerary';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface Props {
  basePrice: number;
  addOns: AddOn[];
  editable?: boolean;
  onBaseChange?: (price: number) => void;
  onAddOnsChange?: (addOns: AddOn[]) => void;
}

export function PricingSection({ basePrice, addOns, editable = false, onBaseChange, onAddOnsChange }: Props) {
  const colors = useColors();
  const total = basePrice + addOns.reduce((s, a) => s + a.price, 0);

  function updateAddOn(id: string, updates: Partial<AddOn>) {
    onAddOnsChange?.(addOns.map(a => a.id === id ? { ...a, ...updates } : a));
  }

  async function addAddOn() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddOnsChange?.([...addOns, { id: genId(), name: '', price: 0 }]);
  }

  async function removeAddOn(id: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddOnsChange?.(addOns.filter(a => a.id !== id));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Pricing</Text>

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>Base Price</Text>
        {editable ? (
          <View style={styles.priceInputRow}>
            <Text style={[styles.dollar, { color: colors.mutedForeground }]}>$</Text>
            <TextInput
              style={[styles.priceInput, { borderColor: colors.border, color: colors.foreground }]}
              value={basePrice > 0 ? String(basePrice) : ''}
              onChangeText={v => onBaseChange?.(Number(v.replace(/[^0-9.]/g, '')) || 0)}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />
          </View>
        ) : (
          <Text style={[styles.rowValue, { color: colors.foreground }]}>${basePrice.toLocaleString()}</Text>
        )}
      </View>

      {addOns.length > 0 && (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      )}

      {addOns.map((addon) => (
        <View key={addon.id} style={styles.row}>
          {editable ? (
            <>
              <TextInput
                style={[styles.addonNameInput, { borderColor: colors.border, color: colors.foreground }]}
                value={addon.name}
                onChangeText={v => updateAddOn(addon.id, { name: v })}
                placeholder="Add-on name"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={styles.priceInputRow}>
                <Text style={[styles.dollar, { color: colors.mutedForeground }]}>$</Text>
                <TextInput
                  style={[styles.priceInput, { borderColor: colors.border, color: colors.foreground }]}
                  value={addon.price > 0 ? String(addon.price) : ''}
                  onChangeText={v => updateAddOn(addon.id, { price: Number(v.replace(/[^0-9.]/g, '')) || 0 })}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
              </View>
              <TouchableOpacity onPress={() => removeAddOn(addon.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.addonName, { color: colors.mutedForeground }]}>{addon.name}</Text>
              <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>+${addon.price.toLocaleString()}</Text>
            </>
          )}
        </View>
      ))}

      {editable && (
        <TouchableOpacity style={[styles.addBtn, { borderColor: colors.border }]} onPress={addAddOn} activeOpacity={0.7}>
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Add add-on</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>${total.toLocaleString()}</Text>
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
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  rowValue: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  addonName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dollar: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    width: 80,
    textAlign: 'right',
  },
  addonNameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  divider: {
    height: 1,
  },
  totalLabel: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
});
