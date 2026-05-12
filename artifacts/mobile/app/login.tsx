import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { AccountRole } from '@/types/provider';

type Mode = 'signin' | 'register';

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<AccountRole>('user');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setRole('user');
  }

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) { setError('Your name is required.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = mode === 'signin'
      ? await login(email, password)
      : await register(name, email, password, role);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  }

  function fillDemo(acct: 'coastal' | 'euro' | 'user') {
    setMode('signin');
    if (acct === 'coastal') { setEmail('coastal@demo.com'); setPassword('demo123'); }
    else if (acct === 'euro') { setEmail('euro@demo.com'); setPassword('demo123'); }
    else { setEmail('alex@demo.com'); setPassword('demo123'); }
    setError('');
  }

  const topPad = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: topPad + 24 }]}>
        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Feather name="map" size={34} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Itinerary Manager</Text>
        <Text style={styles.heroSubtitle}>Sign in to browse or manage trips</Text>
      </View>

      {/* Card */}
      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={[
          styles.card,
          { backgroundColor: colors.background, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mode tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {(['signin', 'register'] as Mode[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, m === mode && { backgroundColor: colors.card }]}
              onPress={() => switchMode(m)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: m === mode ? colors.primary : colors.mutedForeground }]}>
                {m === 'signin' ? 'Sign In' : 'Register'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Your Name</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alex Chen"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View>
              <TextInput
                style={[styles.input, styles.inputPadRight, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                returnKeyType={mode === 'register' ? 'next' : 'done'}
                onSubmitEditing={mode === 'signin' ? handleSubmit : undefined}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'register' && (
            <>
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPw}
                  returnKeyType="done"
                />
              </View>

              {/* Role selector */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Account Type</Text>
                <View style={[styles.rolePicker, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.roleOption, role === 'user' && { backgroundColor: colors.card }]}
                    onPress={() => setRole('user')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconWrap, { backgroundColor: role === 'user' ? colors.secondary : 'transparent' }]}>
                      <Feather name="user" size={16} color={role === 'user' ? colors.primary : colors.mutedForeground} />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text style={[styles.roleTitle, { color: role === 'user' ? colors.foreground : colors.mutedForeground }]}>User</Text>
                      <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>Browse & search</Text>
                    </View>
                    {role === 'user' && <Feather name="check-circle" size={16} color={colors.primary} />}
                  </TouchableOpacity>

                  <View style={[styles.roleDiv, { backgroundColor: colors.border }]} />

                  <TouchableOpacity
                    style={[styles.roleOption, role === 'provider' && { backgroundColor: colors.card }]}
                    onPress={() => setRole('provider')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconWrap, { backgroundColor: role === 'provider' ? colors.secondary : 'transparent' }]}>
                      <Feather name="shield" size={16} color={role === 'provider' ? colors.primary : colors.mutedForeground} />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text style={[styles.roleTitle, { color: role === 'provider' ? colors.foreground : colors.mutedForeground }]}>Provider</Text>
                      <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>Create & manage trips</Text>
                    </View>
                    {role === 'provider' && <Feather name="check-circle" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {error.length > 0 && (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '44' }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.submitText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        <View style={[styles.demoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.primary }]}>Demo Accounts  ·  tap to auto-fill</Text>

          <View style={styles.demoSection}>
            <View style={[styles.demoRoleTag, { backgroundColor: colors.primary + '18' }]}>
              <Feather name="shield" size={11} color={colors.primary} />
              <Text style={[styles.demoRoleLabel, { color: colors.primary }]}>Providers</Text>
            </View>
            <View style={styles.demoRow}>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => fillDemo('coastal')} activeOpacity={0.8}>
                <Text style={[styles.demoBtnName, { color: colors.foreground }]}>Coastal Adventures</Text>
                <Text style={[styles.demoBtnEmail, { color: colors.mutedForeground }]}>coastal@demo.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => fillDemo('euro')} activeOpacity={0.8}>
                <Text style={[styles.demoBtnName, { color: colors.foreground }]}>Euro Travel Co</Text>
                <Text style={[styles.demoBtnEmail, { color: colors.mutedForeground }]}>euro@demo.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.demoSection}>
            <View style={[styles.demoRoleTag, { backgroundColor: colors.muted }]}>
              <Feather name="user" size={11} color={colors.mutedForeground} />
              <Text style={[styles.demoRoleLabel, { color: colors.mutedForeground }]}>User</Text>
            </View>
            <TouchableOpacity style={[styles.demoBtn, { borderColor: colors.border, backgroundColor: colors.card, flexGrow: 0 }]} onPress={() => fillDemo('user')} activeOpacity={0.8}>
              <Text style={[styles.demoBtnName, { color: colors.foreground }]}>Alex Chen</Text>
              <Text style={[styles.demoBtnEmail, { color: colors.mutedForeground }]}>alex@demo.com</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.demoPassword, { color: colors.mutedForeground }]}>All passwords: demo123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  cardScroll: { flex: 1 },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 20,
    minHeight: '100%',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  form: { gap: 14 },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  inputPadRight: { paddingRight: 46 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rolePicker: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  roleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTextWrap: { flex: 1, gap: 2 },
  roleTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  roleDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  roleDiv: { height: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  demoBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  demoTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoSection: { gap: 8 },
  demoRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  demoRoleLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  demoBtnName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  demoBtnEmail: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  demoPassword: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
