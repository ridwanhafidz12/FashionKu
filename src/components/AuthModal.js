import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import { colors, shadows } from '../theme/colors';
import { useAppState } from '../state/AppContext';

const LOGO = require('../../assets/images/fashionku_icon_transparent.png');

export default function AuthModal({ visible, onClose, onSuccess, initialMode = 'login', message }) {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAppState();

  const handleLoginSubmit = async () => {
    if (loading) return;
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama lengkap kamu.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Perhatian', 'Silakan masukkan email yang valid.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });
      } else {
        await login({
          email: email.trim(),
          password: password.trim(),
        });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err?.message?.toLowerCase?.() || '';
      let displayError = err?.message || 'Gagal masuk ke akun.';
      if (errorMsg.includes('invalid login credentials')) {
        displayError = 'Email atau password salah. Silakan periksa kembali.';
      } else if (errorMsg.includes('user already registered')) {
        displayError = 'Email ini sudah terdaftar. Silakan masuk menggunakan password kamu.';
      }
      Alert.alert(mode === 'register' ? 'Pendaftaran Gagal' : 'Login Gagal', displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await login({
        name: 'Adi Arwan Syah',
        email: 'adi.arwansyah@email.com',
        password: 'password123',
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      onClose();
      if (onSuccess) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={isDesktop ? 'fade' : 'slide'}
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, isDesktop && styles.overlayDesktop]}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, isDesktop && styles.sheetDesktop]}>
          {!isDesktop && <View style={styles.handleBar} />}

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
              <View>
                <Text style={styles.brandTitle}>FashionKu</Text>
                <Text style={styles.brandSubtitle}>Sirkular Fashion & Bespoke</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Feather name="x" size={18} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Context Notice Alert */}
            {!!message && (
              <View style={styles.messageBox}>
                <Feather name="lock" size={14} color="#2C6842" style={{ marginTop: 1 }} />
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}

            {/* Segmented Mode Tabs (Laprakin Style) */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Masuk Akun
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Daftar Baru
                </Text>
              </Pressable>
            </View>

            {/* Form Title & Subtitle */}
            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Selamat Datang Kembali!' : 'Mulai Bersama FashionKu'}
            </Text>
            <Text style={styles.formSubtitle}>
              {mode === 'login'
                ? 'Masuk untuk memproses pesanan kustom, melacak paspor DPP, dan menukar poin sirkular.'
                : 'Daftar akun sekarang dan dapatkan 100 Poin Sirkular gratis untuk pesanan pertamamu.'}
            </Text>

            {/* Input Nama Lengkap (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={16} color="#64748B" />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Adi Arwan Syah"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alamat Email</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={16} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                {mode === 'login' && (
                  <Pressable onPress={() => Alert.alert('Lupa Password', 'Silakan gunakan login cepat demo atau hubungi tim bantuan FashionKu.')}>
                    <Text style={styles.forgotLink}>Lupa password?</Text>
                  </Pressable>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={16}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            {/* Primary Submit Button */}
            <AnimatedPressable
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleLoginSubmit}
              disabled={loading}
              scaleDown={0.98}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
                  </Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </>
              )}
            </AnimatedPressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Access (Laprakin Style) */}
            <AnimatedPressable
              style={styles.demoBtn}
              onPress={handleQuickDemoLogin}
              disabled={loading}
              scaleDown={0.98}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={18} color="#2C6842" />
              <Text style={styles.demoBtnText}>Akses Cepat Demo (1-Klik)</Text>
            </AnimatedPressable>

            {/* Security & Privacy Trust Footer */}
            <View style={styles.authFooter}>
              <View style={styles.securityRow}>
                <Feather name="shield" size={12} color="#16A34A" />
                <Text style={styles.securityText}>Enkripsi SSL 256-Bit • Data Terlindungi</Text>
              </View>
              <Text style={styles.legalNotice}>
                Dengan masuk, kamu menyetujui Ketentuan Layanan & Kebijakan Privasi FashionKu.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  overlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    ...shadows.xl,
  },
  sheetDesktop: {
    borderRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C6842',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6E7CE',
  },
  messageText: {
    flex: 1,
    color: '#20603D',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2C6842',
    fontWeight: '800',
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  forgotLink: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2C6842',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#2C6842',
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...shadows.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  demoBtn: {
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: '#C6E7CE',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  demoBtnText: {
    color: '#2C6842',
    fontSize: 12.5,
    fontWeight: '800',
  },
  authFooter: {
    marginTop: 18,
    alignItems: 'center',
    gap: 6,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  legalNotice: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
});
