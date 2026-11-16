/**
 * @file OnboardingScreen.js
 * @description Ultra-premium, responsive onboarding showcase for FashionKu.
 *
 * Fully responsive:
 * - Desktop: Luxury 2-column split showcase layout with full-height editorial photography,
 *   glassmorphic badges, interactive feature cards, and live impact statistics.
 * - Mobile: Immersive, edge-to-edge experience with fluid typography and zero awkward whitespace.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import LeafMark from '../components/LeafMark';
import { onboarding } from '../data/appData';
import { colors, shadows } from '../theme/colors';

const stepThemes = [
  {
    color: colors.forest,
    accent: colors.sand,
    icon: 'tshirt-crew-outline',
    badge: 'PERSONAL STYLE & FIT',
    sceneLabel: 'Profil Gaya & AI Stylist',
    headline: 'Fashion That Fits You',
    subheadline:
      'Temukan pakaian yang dirancang khusus mengikuti warna kulit, bentuk siluet tubuh, dan preferensi gayamu tanpa kompromi.',
    features: [
      { icon: 'palette-outline', label: 'Tone Kulit', desc: 'Warm, Cool, Neutral' },
      { icon: 'human-male', label: 'Siluet Tubuh', desc: 'Hourglass, Pear, Rectangle' },
      { icon: 'star-four-points-outline', label: 'Kustom Bebas', desc: 'Color Picker & Ukuran' },
    ],
    stats: [
      { val: '100%', label: 'Kustom Presisi' },
      { val: 'AI Vision', label: 'Scan Wajah & Badan' },
      { val: 'Garansi Pas', label: 'Bebas Permak' },
    ],
  },
  {
    color: colors.forestMid,
    accent: colors.sand,
    icon: 'recycle',
    badge: 'ZERO DEADSTOCK WASTE',
    sceneLabel: 'Dibuat Setelah Dipesan',
    headline: 'Made After You Order',
    subheadline:
      'Pakaian hanya diproduksi setelah pesanan masuk dari kain sisa atelier kurasi, mengeliminasi 100% limbah kain dan stok mati.',
    features: [
      { icon: 'timer-sand', label: 'On-Demand', desc: 'Hanya jahit saat dipesan' },
      { icon: 'recycle', label: 'Bahan Upcycle', desc: 'Linen, Katun, Rayon sisa' },
      { icon: 'leaf', label: 'Jejak Karbon', desc: 'Hemat 1.8kg CO2e per helai' },
    ],
    stats: [
      { val: '1,280+', label: 'Pesanan MTO' },
      { val: '2.4 Ton', label: 'Kain Dihemat' },
      { val: '0%', label: 'Stok Terbuang' },
    ],
  },
  {
    color: colors.forestDark,
    accent: colors.sand,
    icon: 'account-group-outline',
    badge: 'LOCAL ARTISANS & FAIR WORK',
    sceneLabel: 'Dikerjakan Penjahit Lokal',
    headline: 'Support Local Tailors',
    subheadline:
      'Setiap helai pakaian memberdayakan UMKM penjahit lokal dengan upah adil, transparansi Paspor Digital DPP, dan sistem Rekber aman.',
    features: [
      { icon: 'hand-heart-outline', label: 'Upah Adil', desc: 'Langsung ke penjahit' },
      { icon: 'storefront-outline', label: 'Bengkel UMKM', desc: 'Mitra lokal terkurasi' },
      { icon: 'shield-check-outline', label: 'Rekber Aman', desc: 'Escrow FashionKu' },
    ],
    stats: [
      { val: '134+', label: 'Penjahit UMKM' },
      { val: '4 Kota', label: 'Sentra Mode Lokal' },
      { val: '100%', label: 'Transparansi DPP' },
    ],
  },
];

export default function OnboardingScreen({ onDone }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isDesktop = screenWidth >= 920;
  const isTablet = screenWidth >= 640 && screenWidth < 920;

  const [index, setIndex] = useState(0);
  const item = onboarding[index] || onboarding[0];
  const theme = stepThemes[index] ?? stepThemes[0];
  const isLast = index === onboarding.length - 1;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateX = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateX, {
        toValue: 0,
        speed: 14,
        bounciness: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateX]);

  const transitionTo = (newIndex, direction = 1) => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: -16 * direction,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex(newIndex);
      contentTranslateX.setValue(20 * direction);
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateX, {
          toValue: 0,
          speed: 15,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    transitionTo(index + 1);
  };

  const handleBack = () => {
    if (index > 0) transitionTo(index - 1, -1);
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* ─── DESKTOP SPLIT SHOWCASE LAYOUT (Width >= 920) ──────────────── */}
      {isDesktop ? (
        <View style={styles.desktopCardWrapper}>
          {/* Top Bar inside Desktop Shell */}
          <View style={styles.desktopTopBar}>
            <View style={styles.brandGroup}>
              <View style={styles.brandMark}>
                <LeafMark color={colors.forest} size={22} />
              </View>
              <View>
                <Text style={styles.brandText}>FashionKu</Text>
                <Text style={styles.brandTagline}>Sirkular Fashion Made-To-Order</Text>
              </View>
            </View>

            <View style={styles.desktopTopRight}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>LANGKAH 0{index + 1} DARI 0{onboarding.length}</Text>
              </View>
              <Pressable style={styles.skipButton} onPress={onDone}>
                <Text style={styles.skipText}>Lewati ke Beranda</Text>
                <Feather name="arrow-right" size={14} color={colors.forest} />
              </Pressable>
            </View>
          </View>

          {/* 2-Column Split Content */}
          <View style={styles.desktopSplitBody}>
            {/* Left Column: Atmospheric Image Card */}
            <View style={styles.desktopLeftCol}>
              <View style={styles.desktopHeroCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.desktopHeroImage}
                  resizeMode="cover"
                />
                <View style={styles.desktopHeroOverlay} />

                {/* Floating Top Badge */}
                <View style={styles.desktopFloatingBadge}>
                  <MaterialCommunityIcons name={theme.icon} size={15} color={colors.white} />
                  <Text style={styles.desktopFloatingBadgeText}>{theme.badge}</Text>
                </View>

                {/* Floating Bottom Card */}
                <View style={styles.desktopBottomPillCard}>
                  <View style={styles.desktopBottomPillDot} />
                  <Text style={styles.desktopBottomPillText}>
                    100% Upcycled Fabric • Dikerjakan Penjahit UMKM
                  </Text>
                </View>
              </View>

              {/* Slide Thumbnail Dots */}
              <View style={styles.desktopThumbRow}>
                {onboarding.map((slide, dotIdx) => (
                  <Pressable
                    key={slide.title}
                    style={[
                      styles.desktopThumbDot,
                      index === dotIdx && styles.desktopThumbDotActive,
                    ]}
                    onPress={() => transitionTo(dotIdx, dotIdx > index ? 1 : -1)}
                  >
                    <Text
                      style={[
                        styles.desktopThumbDotText,
                        index === dotIdx && styles.desktopThumbDotTextActive,
                      ]}
                    >
                      0{dotIdx + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Right Column: Narrative Story & Actions */}
            <Animated.View
              style={[
                styles.desktopRightCol,
                {
                  opacity: contentOpacity,
                  transform: [{ translateX: contentTranslateX }],
                },
              ]}
            >
              {/* Progress Line */}
              <View style={styles.desktopProgressBar}>
                {onboarding.map((entry, dotIndex) => (
                  <View key={entry.title} style={styles.desktopProgressSegment}>
                    <View
                      style={[
                        styles.desktopProgressFill,
                        dotIndex <= index && styles.desktopProgressFillActive,
                        dotIndex === index && styles.desktopProgressFillCurrent,
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Sub-label */}
              <View style={styles.topicBadge}>
                <Text style={styles.topicBadgeText}>{theme.sceneLabel.toUpperCase()}</Text>
              </View>

              {/* Headline */}
              <Text style={styles.desktopHeadline}>{theme.headline}</Text>

              {/* Subheadline / Narrative */}
              <Text style={styles.desktopSubheadline}>{theme.subheadline}</Text>

              {/* Feature Cards Grid (3 cards) */}
              <View style={styles.desktopFeaturesGrid}>
                {theme.features.map((feat) => (
                  <View key={feat.label} style={styles.desktopFeatureCard}>
                    <View style={styles.desktopFeatureIconWrap}>
                      <MaterialCommunityIcons name={feat.icon} size={18} color={colors.forest} />
                    </View>
                    <Text style={styles.desktopFeatureTitle}>{feat.label}</Text>
                    <Text style={styles.desktopFeatureDesc}>{feat.desc}</Text>
                  </View>
                ))}
              </View>

              {/* Live Impact Stats Row */}
              <View style={styles.desktopImpactRow}>
                {theme.stats.map((st, i) => (
                  <React.Fragment key={st.label}>
                    {i > 0 && <View style={styles.desktopStatDivider} />}
                    <View style={styles.desktopStatCol}>
                      <Text style={styles.desktopStatVal}>{st.val}</Text>
                      <Text style={styles.desktopStatLabel}>{st.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.desktopActionRow}>
                {index > 0 && (
                  <AnimatedPressable
                    style={styles.desktopBackBtn}
                    onPress={handleBack}
                    scaleDown={0.94}
                  >
                    <Feather name="arrow-left" size={20} color={colors.forest} />
                    <Text style={styles.desktopBackBtnText}>Kembali</Text>
                  </AnimatedPressable>
                )}

                <AnimatedPressable
                  style={[styles.desktopNextBtn, index === 0 && { flex: 1 }]}
                  onPress={handleNext}
                  scaleDown={0.97}
                >
                  <Text style={styles.desktopNextBtnText}>
                    {isLast ? 'Mulai Eksplorasi Sekarang' : 'Lanjut ke Tahap Berikutnya'}
                  </Text>
                  <View style={styles.desktopNextBtnCircle}>
                    <Feather name={isLast ? 'check' : 'arrow-right'} size={18} color={colors.forest} />
                  </View>
                </AnimatedPressable>
              </View>
            </Animated.View>
          </View>
        </View>
      ) : (
        /* ─── MOBILE & TABLET IMMERSIVE LAYOUT ───────────────────────── */
        <ScrollView
          style={styles.mobileScroll}
          contentContainerStyle={styles.mobileContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Bar */}
          <View style={styles.mobileTopBar}>
            <View style={styles.brandGroup}>
              <View style={styles.brandMarkSmall}>
                <LeafMark color={colors.forest} size={18} />
              </View>
              <Text style={styles.brandTextSmall}>FashionKu</Text>
            </View>

            <Pressable style={styles.skipButton} onPress={onDone}>
              <Text style={styles.skipText}>Lewati</Text>
              <Feather name="arrow-right" size={13} color={colors.warmGray} />
            </Pressable>
          </View>

          {/* Progress Row */}
          <View style={styles.mobileProgressRow}>
            {onboarding.map((entry, dotIndex) => (
              <View key={entry.title} style={styles.mobileProgressSegment}>
                <View
                  style={[
                    styles.mobileProgressFill,
                    dotIndex <= index && styles.mobileProgressFillActive,
                    dotIndex === index && styles.mobileProgressFillCurrent,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Hero Image Card */}
          <View style={styles.mobileHeroCard}>
            <Image source={{ uri: item.image }} style={styles.mobileHeroImg} resizeMode="cover" />
            <View style={styles.mobileHeroOverlay} />
            <View style={styles.mobileTagBadge}>
              <MaterialCommunityIcons name={theme.icon} size={13} color={colors.white} />
              <Text style={styles.mobileTagBadgeText}>{theme.badge}</Text>
            </View>
          </View>

          {/* Animated Story Content */}
          <Animated.View
            style={[
              styles.mobileStoryWrap,
              {
                opacity: contentOpacity,
                transform: [{ translateX: contentTranslateX }],
              },
            ]}
          >
            <View style={styles.mobileStepPill}>
              <Text style={styles.mobileStepPillText}>0{index + 1} / 0{onboarding.length}</Text>
            </View>

            <Text style={styles.mobileHeadline}>{theme.headline}</Text>
            <Text style={styles.mobileDesc}>{theme.subheadline}</Text>

            {/* Feature Pills */}
            <View style={styles.mobileFeatureRow}>
              {theme.features.map((feat) => (
                <View key={feat.label} style={styles.mobileFeaturePill}>
                  <MaterialCommunityIcons name={feat.icon} size={13} color={colors.forest} />
                  <Text style={styles.mobileFeatureText}>{feat.label}</Text>
                </View>
              ))}
            </View>

            {/* Impact Row */}
            <View style={styles.mobileImpactCard}>
              {theme.stats.map((st, i) => (
                <React.Fragment key={st.label}>
                  {i > 0 && <View style={styles.mobileStatDivider} />}
                  <View style={styles.mobileStatCol}>
                    <Text style={styles.mobileStatVal}>{st.val}</Text>
                    <Text style={styles.mobileStatLabel}>{st.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>

          {/* Bottom Actions */}
          <View style={styles.mobileActionRow}>
            {index > 0 && (
              <AnimatedPressable
                style={styles.mobileBackBtn}
                onPress={handleBack}
                scaleDown={0.93}
              >
                <Feather name="arrow-left" size={20} color={colors.forest} />
              </AnimatedPressable>
            )}

            <AnimatedPressable
              style={[styles.mobileNextBtn, index === 0 && { flex: 1 }]}
              onPress={handleNext}
              scaleDown={0.97}
            >
              <View style={styles.mobileNextBtnContent}>
                <Text style={styles.mobileNextBtnHint}>
                  {isLast ? 'SEMUA SIAP' : 'LANGKAH BERIKUTNYA'}
                </Text>
                <Text style={styles.mobileNextBtnText}>
                  {isLast ? 'Mulai Sekarang' : 'Lanjut'}
                </Text>
              </View>
              <View style={styles.mobileNextBtnCircle}>
                <Feather name={isLast ? 'check' : 'arrow-right'} size={18} color={colors.forest} />
              </View>
            </AnimatedPressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F5F4',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  // ─── Desktop Styles ─────────────────────────────────────────────────────────
  desktopCardWrapper: {
    maxWidth: 1300,
    width: '94%',
    minHeight: 640,
    maxHeight: 820,
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    ...shadows.xl,
    justifyContent: 'space-between',
  },
  desktopTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTagline: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '600',
  },
  desktopTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepBadge: {
    backgroundColor: colors.sandLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: 0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  desktopSplitBody: {
    flexDirection: 'row',
    gap: 28,
    flex: 1,
    paddingTop: 18,
    alignItems: 'center',
  },
  desktopLeftCol: {
    width: '46%',
    height: '100%',
    minHeight: 480,
    justifyContent: 'space-between',
  },
  desktopHeroCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.md,
  },
  desktopHeroImage: {
    width: '100%',
    height: '100%',
  },
  desktopHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 19, 0.22)',
  },
  desktopFloatingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(44, 104, 66, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    ...shadows.sm,
  },
  desktopFloatingBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  desktopBottomPillCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    ...shadows.sm,
  },
  desktopBottomPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forest,
  },
  desktopBottomPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.charcoal,
    flex: 1,
  },
  desktopThumbRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  desktopThumbDot: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sand,
  },
  desktopThumbDotActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  desktopThumbDotText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
  },
  desktopThumbDotTextActive: {
    color: colors.white,
  },
  desktopRightCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  desktopProgressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  desktopProgressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 99,
    overflow: 'hidden',
  },
  desktopProgressFill: {
    height: '100%',
    width: 0,
    backgroundColor: colors.forest,
    borderRadius: 99,
  },
  desktopProgressFillActive: {
    width: '100%',
    opacity: 0.35,
  },
  desktopProgressFillCurrent: {
    opacity: 1,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sandLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  topicBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.forest,
    letterSpacing: 0.6,
  },
  desktopHeadline: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.charcoal,
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 8,
  },
  desktopSubheadline: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 16,
  },
  desktopFeaturesGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  desktopFeatureCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  desktopFeatureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  desktopFeatureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.charcoal,
    marginBottom: 2,
  },
  desktopFeatureDesc: {
    fontSize: 10,
    color: colors.warmGray,
    lineHeight: 14,
  },
  desktopImpactRow: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    marginBottom: 20,
    alignItems: 'center',
  },
  desktopStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  desktopStatVal: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.forest,
  },
  desktopStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 2,
  },
  desktopStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.sandDark,
  },
  desktopActionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  desktopBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  desktopBackBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.forest,
  },
  desktopNextBtn: {
    flex: 2,
    height: 52,
    backgroundColor: colors.forest,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    ...shadows.forest,
  },
  desktopNextBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  desktopNextBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Mobile Styles ──────────────────────────────────────────────────────────
  mobileScroll: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.ivory,
  },
  mobileContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  mobileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandMarkSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextSmall: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  mobileProgressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  mobileProgressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: colors.lightGray,
    borderRadius: 99,
    overflow: 'hidden',
  },
  mobileProgressFill: {
    height: '100%',
    width: 0,
    backgroundColor: colors.forest,
  },
  mobileProgressFillActive: {
    width: '100%',
    opacity: 0.35,
  },
  mobileProgressFillCurrent: {
    opacity: 1,
  },
  mobileHeroCard: {
    height: 270,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.sandLight,
    ...shadows.md,
  },
  mobileHeroImg: {
    width: '100%',
    height: '100%',
  },
  mobileHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 25, 22, 0.2)',
  },
  mobileTagBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(31, 48, 38, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  mobileTagBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  mobileStoryWrap: {
    alignItems: 'center',
    paddingTop: 16,
  },
  mobileStepPill: {
    backgroundColor: colors.sandLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 8,
  },
  mobileStepPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.forest,
  },
  mobileHeadline: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  mobileDesc: {
    fontSize: 12,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  mobileFeatureRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  mobileFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  mobileFeatureText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
  },
  mobileImpactCard: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.sand,
    width: '100%',
    alignItems: 'center',
  },
  mobileStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  mobileStatVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.forest,
  },
  mobileStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 1,
  },
  mobileStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.sandDark,
  },
  mobileActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  mobileBackBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 8,
    ...shadows.forest,
  },
  mobileNextBtnContent: {
    alignItems: 'flex-start',
  },
  mobileNextBtnHint: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
  },
  mobileNextBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },
  mobileNextBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
