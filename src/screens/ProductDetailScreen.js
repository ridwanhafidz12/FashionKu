import React, { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import PassportModal from '../components/PassportModal';
import { formatCurrency, computeEcoScore } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

export default function ProductDetailScreen({ product, onBack, onCustomize, onChat }) {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState('M');
  const [notes, setNotes] = useState('');
  const [showPassport, setShowPassport] = useState(false);
  const { wishlist, toggleWishlist, styleProfile, requireAuth } = useAppState();
  const favorite = wishlist.includes(product.id);

  const handleOrder = () => onCustomize({ size, notes });

  const handleChat = () => {
    requireAuth(onChat, 'Masuk ke akun untuk berkonsultasi langsung dengan penjahit.');
  };

  const demoOrder = {
    id: `DPP-${product.id}`,
    product: product.name,
    tailor: product.tailor,
    tailorCity: product.tailorCity,
    price: formatCurrency(product.price),
    rawPrice: product.price,
    image: product.image,
    material: product.material,
    savedFabric: product.savedFabric,
    status: 'COMPLETED',
    orderType: 'mto',
    placedAtLabel: 'Hari ini',
    eta: product.eta,
    passport: {
      id: `DPP-${product.id}`,
      serialNumber: `CRC-${String(product.id).toUpperCase()}-2026`,
      productName: product.name,
      tailor: product.tailor,
      productionLocation: product.tailorCity,
      materialOrigin: product.material,
      impact: {
        savedFabric: product.savedFabric,
        estimatedCo2: '2.7 kg CO₂',
      },
      verificationCode: 'VERIFIED-CIRCULAI-CHAIN',
      issuedAt: '2026-08-21',
      activatedAt: '2026-08-21',
      status: 'ACTIVE',
      verification: 'Terverifikasi Sirkular',
      qrSeed: 98765,
    },
  };

  return (
    <View style={layout.flex}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Hero image ─────────────────────────────────────────────── */}
        <ImageBackground
          source={{ uri: product.image }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          {/* Gradient overlay */}
          <View style={styles.heroGradient} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <AnimatedPressable style={styles.iconButton} onPress={onBack} scaleDown={0.88}>
              <Feather name="chevron-left" size={20} color={colors.charcoal} />
            </AnimatedPressable>
            <View style={styles.topBarRight}>
              <AnimatedPressable
                style={styles.iconButton}
                onPress={() => Alert.alert('Bagikan', 'Bagikan produk ini ke teman.')}
                scaleDown={0.88}
              >
                <Feather name="share-2" size={18} color={colors.charcoal} />
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.iconButton, favorite && styles.iconButtonFavorite]}
                onPress={() => requireAuth(() => toggleWishlist(product.id), 'Masuk ke akun untuk menyimpan produk ke Wishlist.')}
                scaleDown={0.88}
              >
                <Feather
                  name="heart"
                  size={18}
                  color={favorite ? colors.terracotta : colors.charcoal}
                />
              </AnimatedPressable>
            </View>
          </View>

          {/* Fabric saved badge */}
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="leaf" size={12} color={colors.forest} />
            <Text style={styles.heroBadgeText}>{product.savedFabric} kain terselamatkan</Text>
          </View>
        </ImageBackground>

        {/* ─── Detail body ────────────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Title + rating */}
          <View style={styles.titleRow}>
            <View style={styles.titleArea}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.tailor}>by {product.tailor} · {product.tailorCity}</Text>
            </View>
            <View style={styles.ratingPill}>
              <Feather name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            {product.badges.map((badge) => (
              <View key={badge} style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.personalBadge}>
            <MaterialCommunityIcons name="palette-outline" size={15} color={colors.forest} />
            <View style={layout.flex}>
              <Text style={styles.personalBadgeTitle}>Cocok untuk warna kulitmu</Text>
              <Text style={styles.personalBadgeText}>
                {styleProfile ? 'Disesuaikan dari hasil profil AI Stylist Anda.' : 'Lengkapi AI Stylist untuk rekomendasi warna personal.'}
              </Text>
            </View>
          </View>

          {/* Digital Product Passport CTA Banner */}
          <AnimatedPressable
            style={styles.dppBanner}
            onPress={() => setShowPassport(true)}
            scaleDown={0.97}
          >
            <View style={styles.dppBannerLeft}>
              <View style={styles.dppBannerIcon}>
                <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.white} />
              </View>
              <View style={styles.dppBannerCopy}>
                <Text style={styles.dppBannerTitle}>Digital Product Passport (DPP)</Text>
                <Text style={styles.dppBannerSub}>
                  Eco-Score {computeEcoScore(product)}/100 · Verifikasi jejak sirkular & material
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.white} />
          </AnimatedPressable>

          {/* Info card */}
          <View style={styles.infoCard}>
            <InfoRow icon="clock" label="Estimasi Produksi" value={product.eta} />
            <View style={styles.infoCardDivider} />
            <InfoRow icon="scissors-cutting" label="Material" value={product.material} family="material" />
            <View style={styles.infoCardDivider} />
            <InfoRow icon="map-pin" label="Penjahit" value={product.tailorCity} />
          </View>

          {/* Size selector */}
          <Text style={styles.sectionTitle}>Pilih Ukuran</Text>
          <View style={styles.sizeContainer}>
            <View style={styles.standardSizeRow}>
              {['XS', 'S', 'M', 'L'].map((item) => (
                <AnimatedPressable
                  key={item}
                  style={[styles.sizeCircle, size === item && styles.sizeCircleActive]}
                  onPress={() => setSize(item)}
                  scaleDown={0.92}
                >
                  <Text style={[styles.sizeCircleText, size === item && styles.sizeCircleTextActive]}>
                    {item}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>

            <AnimatedPressable
              style={[styles.customSizePill, size === 'Custom' && styles.customSizePillActive]}
              onPress={() => setSize('Custom')}
              scaleDown={0.95}
            >
              <MaterialCommunityIcons
                name="ruler"
                size={14}
                color={size === 'Custom' ? colors.white : colors.forest}
              />
              <Text style={[styles.customSizeText, size === 'Custom' && styles.customSizeTextActive]}>
                Custom (Sesuai Ukuran Tubuh)
              </Text>
            </AnimatedPressable>
          </View>

          {size === 'Custom' && (
            <View style={styles.customAlert}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.forest} />
              <Text style={styles.customAlertText}>
                Profil AI Stylist Anda teraktifkan. Penjahit akan memotong pola kain sesuai detail ukuran Anda.
              </Text>
            </View>
          )}

          {/* Measurements */}
          <Text style={styles.sectionTitle}>Ukuran yang dibutuhkan</Text>
          <View style={styles.measureList}>
            {product.measurements.map((item) => (
              <View key={item} style={styles.measureItem}>
                <View style={styles.measureDot}>
                  <Feather name="check" size={11} color={colors.forest} />
                </View>
                <Text style={styles.measureText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Notes input */}
          <Text style={styles.sectionTitle}>Catatan Khusus</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Catatan ukuran, request panjang lengan, atau preferensi fit..."
            placeholderTextColor={colors.warmGrayLight}
            multiline
            style={styles.notesInput}
          />

          {/* Suitable for */}
          <View style={styles.recommendCard}>
            <View style={styles.recommendHeader}>
              <Feather name="target" size={14} color={colors.forest} />
              <Text style={styles.recommendTitle}>Cocok untuk</Text>
            </View>
            <View style={styles.recommendWrap}>
              {product.recommendations.map((item) => (
                <View key={item} style={styles.recommendChip}>
                  <Text style={styles.recommendText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ─── Ulasan & Rating Produk dengan Lampiran Foto Pembeli ───── */}
          <View style={styles.reviewSection}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.reviewTitle}>Penilaian Produk</Text>
                <View style={styles.reviewScoreRow}>
                  <Text style={styles.reviewScoreNum}>4.9</Text>
                  <Text style={styles.reviewScoreMax}>/5.0</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={13} color="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.reviewTotalText}>(128 ulasan)</Text>
                </View>
              </View>
              <View style={styles.satisfactionBadge}>
                <Feather name="thumbs-up" size={13} color={colors.forest} />
                <Text style={styles.satisfactionText}>98% Puas</Text>
              </View>
            </View>

            {/* Buyer Review Items */}
            <View style={styles.reviewItem}>
              <View style={styles.reviewerTop}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerAvatarText}>AL</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>anindya.larasati</Text>
                  <View style={styles.starRowSmall}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={11} color="#F59E0B" />
                    ))}
                    <Text style={styles.reviewDate}>12 Mei 2026</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.reviewVariant}>Variasi: Sage Green, Ukuran Custom (Dada 92cm)</Text>
              <Text style={styles.reviewComment}>
                Jahitan rapi banget, bahan linen sisa ateliernya jatuh dan super adem! Pas banget di badan sesuai ukuran yang kuisi. Penjahitnya sangat responsif dan ramah saat chat fitting.
              </Text>

              {/* Photos attached by buyer */}
              <View style={styles.reviewPhotosRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.reviewPhoto}
                />
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.reviewPhoto}
                />
              </View>

              <View style={styles.reviewLikeRow}>
                <Feather name="thumbs-up" size={12} color={colors.warmGray} />
                <Text style={styles.reviewLikeText}>Membantu (24)</Text>
              </View>
            </View>

            <View style={styles.reviewItem}>
              <View style={styles.reviewerTop}>
                <View style={[styles.reviewerAvatar, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={[styles.reviewerAvatarText, { color: '#3730A3' }]}>DP</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewerName}>dimas_prayoga</Text>
                  <View style={styles.starRowSmall}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={11} color="#F59E0B" />
                    ))}
                    <Text style={styles.reviewDate}>28 Apr 2026</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.reviewVariant}>Variasi: Indigo Denim, Ukuran L</Text>
              <Text style={styles.reviewComment}>
                Senang banget bisa beli baju sirkular yang kualitasnya setara brand butik ternama. Detail paspor digitalnya beneran bisa discan dan keliatan jejak kain sisa yang dihemat!
              </Text>

              <View style={styles.reviewPhotosRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.reviewPhoto}
                />
              </View>

              <View style={styles.reviewLikeRow}>
                <Feather name="thumbs-up" size={12} color={colors.warmGray} />
                <Text style={styles.reviewLikeText}>Membantu (19)</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacer for sticky CTA */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* ─── Sticky CTA bar ─────────────────────────────────────────────── */}
      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.ctaBarInner}>
          <AnimatedPressable
            style={styles.chatButton}
            onPress={handleChat}
            scaleDown={0.92}
          >
            <Feather name="message-circle" size={20} color={colors.forest} />
          </AnimatedPressable>

          <AnimatedPressable style={styles.orderButton} onPress={handleOrder} scaleDown={0.97}>
            <View style={styles.orderButtonContent}>
              <Text style={styles.orderButtonText} numberOfLines={1}>Kustomisasi & Pesan Sekarang</Text>
              <Text style={styles.orderButtonSub} numberOfLines={1}>Bebas atur warna, ukuran, & bahan MTO</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.white} />
          </AnimatedPressable>
        </View>
      </View>

      {showPassport && (
        <PassportModal
          order={demoOrder}
          initialTab="passport"
          onClose={() => setShowPassport(false)}
        />
      )}
    </View>
  );
}

function InfoRow({ icon, label, value, family = 'feather' }) {
  const Icon = family === 'material' ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={15} color={colors.forest} />
      </View>
      <View style={styles.infoTextArea}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
  },
  // ─── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    height: 380,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  heroImage: {
    backgroundColor: colors.sand,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,36,33,0.15)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    ...shadows.sm,
  },
  iconButtonFavorite: {
    backgroundColor: 'rgba(255,240,238,0.96)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.94)',
    ...shadows.sm,
  },
  heroBadgeText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  // ─── Body ─────────────────────────────────────────────────────────────────
  body: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
    backgroundColor: colors.ivory,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
  },
  name: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  tailor: {
    color: colors.warmGray,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  ratingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.warningLight,
  },
  ratingText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '900',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(47,79,58,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
  },
  badgeText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  price: {
    color: colors.forest,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  personalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
    marginBottom: 18,
  },
  personalBadgeTitle: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '900',
  },
  personalBadgeText: {
    color: colors.warmGray,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  // ─── Digital Product Passport Banner ──────────────────────────────────────
  dppBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.forest,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    ...shadows.forest,
  },
  dppBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  dppBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dppBannerCopy: {
    flex: 1,
  },
  dppBannerTitle: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  dppBannerSub: {
    color: colors.sand,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  // ─── Info card ────────────────────────────────────────────────────────────
  infoCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.white,
    marginBottom: 22,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoCardDivider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 8,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successLight,
  },
  infoTextArea: {
    flex: 1,
  },
  infoLabel: {
    color: colors.warmGray,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  infoValue: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  // ─── Section title ────────────────────────────────────────────────────────
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  // ─── Size selector ────────────────────────────────────────────────────────
  sizeContainer: {
    gap: 10,
    marginBottom: 22,
  },
  standardSizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeCircle: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  sizeCircleActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
    ...shadows.sm,
  },
  sizeCircleText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  sizeCircleTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  customSizePill: {
    flexDirection: 'row',
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    paddingHorizontal: 16,
  },
  customSizePillActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  customSizeText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  customSizeTextActive: {
    color: colors.white,
  },
  customAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(47,79,58,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.12)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  customAlertText: {
    flex: 1,
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  // ─── Measurements ─────────────────────────────────────────────────────────
  measureList: {
    gap: 9,
    marginBottom: 22,
  },
  measureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  measureDot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successLight,
  },
  measureText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '600',
  },
  // ─── Notes ────────────────────────────────────────────────────────────────
  notesInput: {
    minHeight: 96,
    borderRadius: 18,
    padding: 14,
    textAlignVertical: 'top',
    color: colors.charcoal,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 18,
    fontWeight: '400',
  },
  // ─── Recommend card ───────────────────────────────────────────────────────
  recommendCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  recommendTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  recommendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recommendChip: {
    borderRadius: 9999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  recommendText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  // ─── Sticky CTA ───────────────────────────────────────────────────────────
  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(250,247,240,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    width: '100%',
    ...shadows.xl,
  },
  ctaBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  chatButton: {
    width: 52,
    height: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF7EE',
    borderWidth: 1.5,
    borderColor: colors.forest,
  },
  orderButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.forest,
    ...shadows.sm,
  },
  orderButtonContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingRight: 10,
  },
  orderButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  orderButtonSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  // ─── Reviews & Ratings ──────────────────────────────────────────────────
  reviewSection: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.charcoal,
  },
  reviewScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  reviewScoreNum: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.forest,
  },
  reviewScoreMax: {
    fontSize: 12,
    color: colors.warmGray,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: 4,
  },
  reviewTotalText: {
    fontSize: 11,
    color: colors.warmGray,
    marginLeft: 4,
  },
  satisfactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.sandLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  satisfactionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
  },
  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  reviewerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.forest,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.charcoal,
  },
  starRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.warmGray,
    marginLeft: 6,
  },
  reviewVariant: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 6,
  },
  reviewComment: {
    fontSize: 12,
    color: colors.charcoal,
    lineHeight: 18,
    marginTop: 6,
  },
  reviewPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  reviewPhoto: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.sand,
  },
  reviewLikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  reviewLikeText: {
    fontSize: 10,
    color: colors.warmGray,
    fontWeight: '600',
  },
});
