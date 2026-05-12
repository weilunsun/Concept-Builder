import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useItineraries } from '@/context/ItineraryContext';
import { useColors } from '@/hooks/useColors';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.78;

function Initials({ name, size = 44 }: { name: string; size?: number }) {
  const colors = useColors();
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{letters.toUpperCase()}</Text>
    </View>
  );
}

export function HamburgerMenu() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { provider, logout } = useAuth();
  const { itineraries } = useItineraries();
  const [open, setOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const myCount = provider
    ? itineraries.filter(it => it.providerId === provider.id).length
    : 0;

  function openDrawer() {
    setOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  function closeDrawer(cb?: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      cb?.();
    });
  }

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeDrawer(async () => {
      await logout();
      router.replace('/login');
    });
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <>
      <TouchableOpacity
        onPress={openDrawer}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={colors.foreground} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" statusBarTranslucent>
        <View style={styles.modalRoot}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={() => closeDrawer()}>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Drawer panel */}
          <Animated.View
            style={[
              styles.drawer,
              {
                width: DRAWER_WIDTH,
                backgroundColor: colors.card,
                transform: [{ translateX: slideAnim }],
                paddingTop: topPad + 20,
                paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 16,
              },
            ]}
          >
            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => closeDrawer()} activeOpacity={0.7}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            {/* Provider info */}
            <View style={styles.providerSection}>
              {provider && <Initials name={provider.name} size={56} />}
              <Text style={[styles.providerName, { color: colors.foreground }]}>
                {provider?.name ?? 'Guest'}
              </Text>
              <Text style={[styles.providerEmail, { color: colors.mutedForeground }]}>
                {provider?.email ?? ''}
              </Text>
              <View style={[styles.providerBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="shield" size={12} color={colors.primary} />
                <Text style={[styles.providerBadgeText, { color: colors.primary }]}>Provider / Admin</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{myCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>My Itineraries</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {provider ? Math.floor((Date.now() - provider.createdAt) / 86400000) : 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days Active</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Menu items */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => closeDrawer()}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.secondary }]}>
                  <Feather name="map" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.foreground }]}>All Itineraries</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => closeDrawer(() => router.push('/create'))}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.secondary }]}>
                  <Feather name="plus-circle" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.foreground }]}>New Itinerary</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Sign out — pinned to bottom */}
            <View style={styles.spacer} />
            <TouchableOpacity
              style={[styles.signOutBtn, { borderColor: colors.destructive + '44', backgroundColor: colors.destructive + '0D' }]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Feather name="log-out" size={16} color={colors.destructive} />
              <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  providerSection: {
    alignItems: 'flex-start',
    gap: 6,
    paddingBottom: 8,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  providerName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  providerEmail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  providerBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  spacer: { flex: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
