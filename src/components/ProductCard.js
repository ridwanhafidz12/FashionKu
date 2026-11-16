/**
 * @file ProductCard.js
 * @description Authentic Shopee-grade product card component with FashionKu brand green design tokens.
 * Features Star+/Mall badges, discount ribbon, Gratis Ongkir XTRA overlay,
 * promo voucher chips, bold Forest Green pricing, rating, sold counter, and city tags.
 */

import React, { memo } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import { colors, shadows } from '../theme/colors';
import { computeEcoScore, formatCurrency } from '../data/appData';

function ProductCard({
  product,
  grid = false,
  favorite = false,
  onPress,
  onToggleFavorite,
  slotStyle,
}) {
  const ecoScore = computeEcoScore(product);
  const isMall = product.id === 'p1' || product.id === 'p3' || (product.tailor && product.tailor.toLowerCase().includes('atelier'));
  const soldCount = product.stock ? (15 - product.stock) * 14 + 42 : 120;
  const formattedPrice = product.price ? product.price.toLocaleString('id-ID') : '0';

  if (grid) {
    // ─── Shopee Grid Card (100% Authentic Shopee Layout) ─────────────────────
    return (
      <AnimatedPressable
        containerStyle={[styles.gridSlot, slotStyle]}
        style={styles.shopeeCard}
        onPress={onPress}
        scaleDown={0.98}
      >
        {/* 1:1 Aspect Ratio Image Container */}
        <ImageBackground
          source={{ uri: product.image }}
          style={styles.shopeeImage}
          imageStyle={styles.imageInner}
        >
          {/* Top Left: Star+ or Mall Badge in Brand Forest Green */}
          <View style={styles.badgeTopLeft}>
            {isMall ? (
              <View style={styles.mallBadge}>
                <Text style={styles.mallBadgeText}>Mall</Text>
              </View>
            ) : (
              <View style={styles.starBadge}>
                <Feather name="star" size={8} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.starBadgeText}>Star+</Text>
              </View>
            )}
          </View>

          {/* Top Right: Discount Ribbon Flag */}
          <View style={styles.shopeeDiscountFlag}>
            <Text style={styles.shopeeDiscountPercent}>35%</Text>
            <Text style={styles.shopeeDiscountLabel}>OFF</Text>
            <View style={styles.ribbonTailTriangle} />
          </View>

          {/* Floating Favorite Wishlist Button */}
          <AnimatedPressable
            style={styles.favoriteBtn}
            onPress={onToggleFavorite}
            hitSlop={8}
            scaleDown={0.88}
          >
            <Feather
              name="heart"
              size={12}
              color={favorite ? colors.forest : '#64748B'}
            />
          </AnimatedPressable>

          {/* Bottom of Image: Gratis Ongkir XTRA & Eco Pill */}
          <View style={styles.imageBottomStrip}>
            <View style={styles.freeShippingBadge}>
              <MaterialCommunityIcons name="truck-fast-outline" size={10} color="#FFFFFF" />
              <Text style={styles.freeShippingText}>Gratis Ongkir XTRA</Text>
            </View>
            <View style={styles.ecoScorePill}>
              <Text style={styles.ecoScoreText}>Eco {ecoScore}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Info Body */}
        <View style={styles.shopeeCardBody}>
          {/* 2-Line Title */}
          <Text style={styles.shopeeTitle} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Shopee Voucher / Promo Tags Row */}
          <View style={styles.tagsRow}>
            <View style={styles.shopeeTagPromo}>
              <Text style={styles.shopeeTagPromoText}>Cashback XTRA</Text>
            </View>
            <View style={styles.shopeeTagEco}>
              <Text style={styles.shopeeTagEcoText}>{product.savedFabric} Kain</Text>
            </View>
          </View>

          {/* Price Row: Brand Forest Green Bold */}
          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>Rp</Text>
            <Text style={styles.priceNumber}>{formattedPrice}</Text>
          </View>

          {/* Bottom Social Proof Row: Rating, Terjual, Location */}
          <View style={styles.bottomMetaRow}>
            <View style={styles.ratingAndSold}>
              <Feather name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingNumber}>{product.rating}</Text>
              <Text style={styles.metaDivider}>|</Text>
              <Text style={styles.soldNumber}>{soldCount}+ Terjual</Text>
            </View>
            <Text style={styles.locationCity} numberOfLines={1}>
              {product.tailorCity || 'Kota Yogyakarta'}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  // ─── Shopee Full / List Card ─────────────────────────────────────────────
  return (
    <AnimatedPressable
      style={styles.listCard}
      onPress={onPress}
      scaleDown={0.98}
    >
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.listImage}
        imageStyle={styles.imageInner}
      >
        <View style={styles.badgeTopLeft}>
          {isMall ? (
            <View style={styles.mallBadge}>
              <Text style={styles.mallBadgeText}>Mall</Text>
            </View>
          ) : (
            <View style={styles.starBadge}>
              <Feather name="star" size={9} color="#FFFFFF" style={{ marginRight: 2 }} />
              <Text style={styles.starBadgeText}>Star+</Text>
            </View>
          )}
        </View>

        <View style={styles.shopeeDiscountFlag}>
          <Text style={styles.shopeeDiscountPercent}>35%</Text>
          <Text style={styles.shopeeDiscountLabel}>OFF</Text>
        </View>

        <AnimatedPressable
          style={styles.favoriteBtnLarge}
          onPress={onToggleFavorite}
          hitSlop={10}
          scaleDown={0.88}
        >
          <Feather
            name="heart"
            size={14}
            color={favorite ? colors.forest : '#64748B'}
          />
        </AnimatedPressable>

        <View style={styles.imageBottomStrip}>
          <View style={styles.freeShippingBadge}>
            <MaterialCommunityIcons name="truck-fast-outline" size={10} color="#FFFFFF" />
            <Text style={styles.freeShippingText}>Gratis Ongkir XTRA</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.listInfo}>
        <View style={styles.tagsRow}>
          <View style={styles.shopeeTagPromo}>
            <Text style={styles.shopeeTagPromoText}>Cashback XTRA</Text>
          </View>
          <View style={styles.shopeeTagEco}>
            <Text style={styles.shopeeTagEcoText}>Eco {ecoScore} • {product.savedFabric}</Text>
          </View>
        </View>

        <Text style={styles.listTitle} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.listTailor} numberOfLines={1}>Oleh {product.tailor} ({product.tailorCity || 'Yogyakarta'})</Text>

        <View style={styles.priceRow}>
          <Text style={styles.currencySymbol}>Rp</Text>
          <Text style={styles.priceNumberLarge}>{formattedPrice}</Text>
        </View>

        <View style={styles.bottomMetaRow}>
          <View style={styles.ratingAndSold}>
            <Feather name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingNumber}>{product.rating}</Text>
            <Text style={styles.metaDivider}>|</Text>
            <Text style={styles.soldNumber}>{soldCount}+ terjual</Text>
          </View>
          <Text style={styles.listEta}>{product.eta || '3-5 hari'}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // ─── Shopee Grid Card ──────────────────────────────────────────────────────
  gridSlot: {
    alignSelf: 'flex-start',
  },
  shopeeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4, // Exact Shopee 4px subtle border radius
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    ...Platform.select({
      web: {
        transition: 'all 0.15s ease-in-out',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      },
      default: {
        ...shadows.sm,
      },
    }),
  },
  shopeeImage: {
    width: '100%',
    aspectRatio: 1, // Exact 1:1 square
    justifyContent: 'space-between',
    position: 'relative',
  },
  imageInner: {
    backgroundColor: '#F8F9FA',
  },

  // ─── Top Badges (Brand Forest Green) ───────────────────────────────────────
  badgeTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest, // Brand Forest Green
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderTopLeftRadius: 3,
    borderBottomRightRadius: 4,
  },
  starBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  mallBadge: {
    backgroundColor: colors.forestMid, // Deep Forest Green
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderTopLeftRadius: 3,
    borderBottomRightRadius: 4,
  },
  mallBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // ─── Discount Ribbon Flag (Soft Gold) ──────────────────────────────────────
  shopeeDiscountFlag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FEF3C7', // Soft warm gold
    paddingHorizontal: 3.5,
    paddingTop: 2,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    width: 34,
  },
  shopeeDiscountPercent: {
    color: '#92400E',
    fontSize: 9.5,
    fontWeight: '900',
    lineHeight: 11,
  },
  shopeeDiscountLabel: {
    color: '#92400E',
    fontSize: 7.5,
    fontWeight: '800',
    lineHeight: 9,
  },
  ribbonTailTriangle: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 4,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FEF3C7',
  },

  // ─── Floating Heart Button ─────────────────────────────────────────────────
  favoriteBtn: {
    position: 'absolute',
    top: 26,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.sm,
  },
  favoriteBtnLarge: {
    position: 'absolute',
    top: 28,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...shadows.sm,
  },

  // ─── Image Bottom Overlay (Gratis Ongkir XTRA) ──────────────────────────────
  imageBottomStrip: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  freeShippingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.ming, // Petroleum teal
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  freeShippingText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ecoScorePill: {
    backgroundColor: colors.forest,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  ecoScoreText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },

  // ─── Info Body ─────────────────────────────────────────────────────────────
  shopeeCardBody: {
    padding: 8,
    paddingTop: 6,
    gap: 4,
  },
  shopeeTitle: {
    fontSize: 12,
    color: '#222222',
    fontWeight: '500',
    lineHeight: 16,
    height: 32, // Exactly 2 lines
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  shopeeTagPromo: {
    borderWidth: 0.75,
    borderColor: '#C6E7CE',
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  shopeeTagPromoText: {
    color: colors.forest,
    fontSize: 8,
    fontWeight: '700',
  },
  shopeeTagEco: {
    borderWidth: 0.75,
    borderColor: '#C7D985',
    backgroundColor: '#F4F8E5',
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  shopeeTagEcoText: {
    color: colors.forestMid,
    fontSize: 8,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currencySymbol: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '700',
    marginRight: 1,
  },
  priceNumber: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  priceNumberLarge: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ratingAndSold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNumber: {
    fontSize: 9.5,
    color: '#333333',
    fontWeight: '700',
  },
  metaDivider: {
    fontSize: 9,
    color: '#D1D5DB',
  },
  soldNumber: {
    fontSize: 9.5,
    color: '#757575',
    fontWeight: '500',
  },
  locationCity: {
    fontSize: 9.5,
    color: '#757575',
    fontWeight: '400',
    maxWidth: 65,
  },

  // ─── List Card Specs ───────────────────────────────────────────────────────
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    marginBottom: 10,
    ...shadows.sm,
  },
  listImage: {
    height: 160,
    justifyContent: 'space-between',
    position: 'relative',
  },
  listInfo: {
    padding: 10,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  listTailor: {
    fontSize: 11,
    color: '#757575',
  },
  listEta: {
    fontSize: 10,
    color: '#94A3B8',
  },
});

export default memo(ProductCard);
