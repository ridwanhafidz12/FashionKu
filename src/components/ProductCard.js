/**
 * @file ProductCard.js
 * @description Product card component supporting grid and list layouts.
 * Wrapped in React.memo for high-performance rendering in long lists.
 */

import React, { memo } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from './AnimatedPressable';
import { colors, shadows } from '../theme/colors';
import { computeEcoScore, formatCurrency } from '../data/appData';

function getEcoColor(score) {
  if (score >= 70) return { bg: colors.successLight, text: colors.success };
  if (score >= 40) return { bg: colors.warningLight, text: colors.warning };
  return { bg: colors.errorLight, text: colors.error };
}

function ProductCard({
  product,
  grid = false,
  favorite = false,
  onPress,
  onToggleFavorite,
  slotStyle,
}) {
  const ecoScore = computeEcoScore(product);
  const ecoTheme = getEcoColor(ecoScore);

  if (grid) {
    // ─── Compact Grid Card ─────────────────────────────────────────────
    return (
      <AnimatedPressable
        containerStyle={[styles.gridSlot, slotStyle]}
        style={styles.gridCard}
        onPress={onPress}
        scaleDown={0.97}
      >
        {/* Image */}
        <ImageBackground
          source={{ uri: product.image }}
          style={styles.gridImage}
          imageStyle={styles.imageStyle}
        >
          {/* Favorite button */}
          <AnimatedPressable
            style={styles.favoriteBtn}
            onPress={onToggleFavorite}
            hitSlop={10}
            scaleDown={0.88}
          >
            <Feather
              name="heart"
              size={13}
              color={favorite ? colors.terracotta : colors.warmGray}
            />
          </AnimatedPressable>

          {/* Badges row — bottom left */}
          <View style={styles.badgeRowOverlay}>
            <View style={styles.savedBadge}>
              <MaterialCommunityIcons name="leaf" size={9} color={colors.forest} />
              <Text style={styles.savedText} numberOfLines={1}>{product.savedFabric}</Text>
            </View>
            <View style={[styles.ecoBadge, { backgroundColor: ecoTheme.bg }]}>
              <Text style={[styles.ecoBadgeText, { color: ecoTheme.text }]}>Eco {ecoScore}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Info */}
        <View style={styles.gridInfo}>
          {/* First badge only — single line, no wrap */}
          {product.badges?.length > 0 && (
            <View style={styles.gridBadge}>
              <Text style={styles.gridBadgeText} numberOfLines={1}>
                {product.badges[0]}
              </Text>
            </View>
          )}

          <Text style={styles.gridTitle} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.gridLocationRow}>
            <Feather name="map-pin" size={9.5} color={colors.warmGray} />
            <Text style={styles.gridTailor} numberOfLines={1}>
              {product.tailorCity || product.tailor || 'Indonesia'}
            </Text>
          </View>

          <View style={styles.gridBottom}>
            <Text style={styles.gridPrice}>
              {formatCurrency(product.price)}
            </Text>
            <View style={styles.ratingPill}>
              <Feather name="star" size={9} color={colors.warning} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <Text style={styles.gridSoldText}>
            Terjual {product.stock ? (15 - product.stock) * 12 + 28 : 50}+
          </Text>
        </View>
      </AnimatedPressable>
    );
  }

  // ─── Full / List Card ────────────────────────────────────────────────
  return (
    <AnimatedPressable
      style={styles.card}
      onPress={onPress}
      scaleDown={0.97}
    >
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <AnimatedPressable
          style={[styles.favoriteBtn, styles.favoriteBtnLarge]}
          onPress={onToggleFavorite}
          hitSlop={10}
          scaleDown={0.88}
        >
          <Feather
            name="heart"
            size={15}
            color={favorite ? colors.terracotta : colors.warmGray}
          />
        </AnimatedPressable>

        <View style={styles.badgeRowOverlay}>
          <View style={styles.savedBadge}>
            <MaterialCommunityIcons name="leaf" size={10} color={colors.forest} />
            <Text style={styles.savedText}>{product.savedFabric} hemat</Text>
          </View>
          <View style={[styles.ecoBadge, { backgroundColor: ecoTheme.bg }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={10} color={ecoTheme.text} />
            <Text style={[styles.ecoBadgeText, { color: ecoTheme.text }]}>Eco Score {ecoScore}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.info}>
        <View style={styles.badges}>
          {product.badges.slice(0, 2).map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.tailor} numberOfLines={1}>by {product.tailor}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.price} numberOfLines={1}>{formatCurrency(product.price)}</Text>
          <View style={styles.ratingPill}>
            <Feather name="star" size={11} color={colors.warning} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>

        <View style={styles.etaRow}>
          <Feather name="clock" size={10} color={colors.warmGrayLight} />
          <Text style={styles.eta}>{product.eta}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // ─── Full card ────────────────────────────────────────────────────────────
  card: {
    borderRadius: 20,
    backgroundColor: colors.white,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.md,
  },
  image: {
    height: 180,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  info: {
    padding: 13,
    paddingTop: 11,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 7,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(47,79,58,0.09)',
    maxWidth: 120,
  },
  badgeText: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  title: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  tailor: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
    marginRight: 8,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eta: {
    color: colors.warmGrayLight,
    fontSize: 10,
  },
  // ─── Grid card ────────────────────────────────────────────────────────────
  gridCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  gridInfo: {
    padding: 10,
    gap: 3,
  },
  gridBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#EDF7EE',
    borderWidth: 0.5,
    borderColor: '#C6E7CE',
    maxWidth: '100%',
  },
  gridBadgeText: {
    color: '#2C6842',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gridTitle: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  gridLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  gridTailor: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '500',
  },
  gridBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 4,
  },
  gridSlot: {
    alignSelf: 'flex-start',
  },
  gridPrice: {
    color: '#2C6842',
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  gridSoldText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  // ─── Shared ───────────────────────────────────────────────────────────────
  imageStyle: {
    backgroundColor: colors.sand,
  },
  favoriteBtn: {
    alignSelf: 'flex-end',
    margin: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    ...shadows.sm,
  },
  favoriteBtnLarge: {
    width: 34,
    height: 34,
    margin: 10,
  },
  badgeRowOverlay: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    margin: 8,
    marginTop: 0,
    flexWrap: 'wrap'
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.94)',
    ...shadows.sm,
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    ...shadows.sm,
  },
  ecoBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  savedText: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '800',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 9999,
    flexShrink: 0,
  },
  ratingText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: '800',
  },
});

export default memo(ProductCard);

