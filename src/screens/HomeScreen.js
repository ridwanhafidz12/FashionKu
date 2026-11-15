/**
 * @file HomeScreen.js
 * @description Landing screen for CIRCULAI.
 *
 * Features: auto-scrolling hero carousel, trust marquee, service launcher
 * grid, Flash Sale section with countdown timer, product grid, tailor
 * spotlight, and sustainability impact dashboard.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import IconButton from '../components/IconButton';
import LeafMark from '../components/LeafMark';
import MetricCard from '../components/MetricCard';
import PassportModal from '../components/PassportModal';
import PassportScannerModal from '../components/PassportScannerModal';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';
import { formatCurrency } from '../data/appData';

const serviceIcons = [
  { id: 'bespoke', label: 'Bespoke', icon: 'scissors-cutting', color: colors.forest, route: 'custom-design' },
  { id: 'quiz', label: 'AI Stylist', icon: 'sparkles', color: colors.ming, route: 'quiz' },
  { id: 'exchange', label: 'Eco Swap', icon: 'recycle', color: colors.forest, route: 'exchange' },
  { id: 'mto', label: 'Koleksi MTO', icon: 'hanger', color: colors.indigoDye, route: 'explore' },
  { id: 'tailor', label: 'Penjahit', icon: 'account-group-outline', color: colors.forestMid, route: 'explore' },
  { id: 'passport', label: 'Paspor DPP', icon: 'qrcode-scan', color: colors.forest, route: 'passport-info' },
  { id: 'voucher', label: 'Poin Sirkular', icon: 'tag-multiple-outline', color: colors.ming, route: 'exchange' },
  { id: 'flash', label: 'Kurasi Spesial', icon: 'star-outline', color: colors.forest, route: 'explore' },
];

export default function HomeScreen({ isActive = true, onNavigate, onProductPress, onTailorPress, onExchange }) {
  const { width: screenWidth } = useWindowDimensions();
  const maxContentWidth = Math.min(screenWidth, 1200);
  const heroWidth = maxContentWidth;
  const numCols = screenWidth >= 1100 ? 4 : screenWidth >= 768 ? 3 : 2;
  const gridGap = screenWidth < 500 ? 12 : 16;
  const availableGridWidth = maxContentWidth - 32;
  const cardWidth = Math.floor((availableGridWidth - (numCols - 1) * gridGap) / numCols);
  const cardSlotStyle = {
    width: cardWidth,
  };
  const [category, setCategory] = useState('Semua');
  const [heroIndex, setHeroIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scannedPassportOrder, setScannedPassportOrder] = useState(null);
  const [flashSaleTime, setFlashSaleTime] = useState({ h: '00', m: '00', s: '00' });

  const {
    categories,
    products,
    tailors,
    wishlist,
    orders,
    cart,
    toggleWishlist,
    circularPoints,
    isLoggedIn,
    openAuthModal,
    requireAuth,
    addresses,
    selectedAddress,
    setNotice,
    backend,
  } = useAppState();

  const heroSlides = useMemo(() => {
    const prodImg1 = products[0]?.image || 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/6d2ec2e1f3f544a8b4d71c61e34a1467~.jpeg.webp';
    const prodImg2 = products[4]?.image || products[1]?.image || 'https://images.tokopedia.net/img/cache/700/aphluv/1997/1/1/43427d1d8a6642af8db7bbc290ee71d3~.jpeg.webp';
    const prodImg3 = products[1]?.image || products[2]?.image || 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/99/MTA-185118741/brd-74257_full01-473f6415.webp';

    return [
      {
        id: 'circular-sale',
        badge: 'Circular Fashion Day',
        badgeIcon: 'recycle',
        title: 'Diskon s.d. 60%\n+ Extra Poin Daur Ulang',
        copy: 'Kain sisa atelier pilihan dengan potongan harga terbesar bulan ini.',
        button: 'Jelajahi Promo',
        route: 'explore',
        image: prodImg1,
      },
      {
        id: 'bespoke-studio',
        badge: 'Made After You Order',
        badgeIcon: 'hanger',
        title: 'Made For You,\nNot For Landfill',
        copy: 'Desain kustom baju buatan penjahit lokal sesuai ukuran tubuhmu.',
        button: 'Coba Bespoke Studio',
        route: 'custom-design',
        image: prodImg2,
      },
      {
        id: 'ai-stylist',
        badge: 'Smart Match AI',
        badgeIcon: 'lightning-bolt',
        title: 'Find Your\nPersonal Palette',
        copy: 'Rekomendasi outfit cocok dengan warna kulit & bentuk tubuhmu.',
        button: 'Coba AI Stylist',
        route: 'quiz',
        image: prodImg3,
      },
    ];
  }, [products]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await backend.refresh();
    } catch {
      // Refresh failed silently — backend status will reflect this
    } finally {
      setIsRefreshing(false);
    }
  };

  const heroScrollRef = useRef(null);
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroIsDragging = useRef(false);

  const featuredProducts = category === 'Semua'
    ? products
    : products.filter((p) => p.category === category);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = setInterval(() => {
      if (heroIsDragging.current) return;
      const nextIndex = (heroIndex + 1) % (heroSlides.length || 1);
      heroScrollRef.current?.scrollTo({
        x: nextIndex * heroWidth,
        animated: true,
      });
      setHeroIndex(nextIndex);
    }, 4800);

    const flashTimer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay - now;

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setFlashSaleTime({ h, m, s });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(flashTimer);
    };
  }, [heroIndex, heroSlides.length, heroWidth, isActive]);

  const handleHeroScrollEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / heroWidth);
    heroIsDragging.current = false;
    setHeroIndex(nextIndex);
  };

  /**
   * Copies the promo code to the clipboard.
   * Uses the Web Share API as a modern cross-platform alternative that
   * doesn't rely on the deprecated `Clipboard` module from react-native.
   */
  const copyPromoCode = async () => {
    try {
      await Share.share({ message: 'NUZ2026-25' });
    } catch {
      // Share cancelled or not supported — silently ignore.
    }
    setCopiedCode(true);
    setNotice('Kode voucher NUZ2026-25 berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const activeAddress = selectedAddress ?? addresses?.[0];
  const activeAddressLabel = activeAddress?.detail
    ? `${activeAddress.label} — ${activeAddress.detail}`
    : 'Tambah alamat biar belanja lebih asyik';

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView
        style={layout.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.forest}
            colors={[colors.forest]}
          />
        }
      >
        {/* ─── Top Header Bar ────────────────────────────────────────── */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderInner}>
            {/* Personalized Greeting Strip */}
            <View style={styles.greetingStrip}>
              <View style={styles.greetingLeft}>
                <MaterialCommunityIcons name="hand-wave" size={14} color={colors.warning} />
                <Text style={styles.greetingText}>
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 11) return 'Selamat Pagi';
                    if (hour < 15) return 'Selamat Siang';
                    if (hour < 18) return 'Selamat Sore';
                    return 'Selamat Malam';
                  })()}
                  {isLoggedIn ? ', Adi!' : '! Selamat datang di CIRCULAI'}
                </Text>
              </View>
              <Pressable style={styles.greetingImpactBtn} onPress={() => onNavigate('impact')}>
                <MaterialCommunityIcons name="leaf" size={11} color={colors.forest} />
                <Text style={styles.greetingImpactText}>{circularPoints} poin</Text>
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              {/* Scan Icon */}
              <Pressable
                style={styles.scanBtn}
                onPress={() => setScanModalVisible(true)}
                hitSlop={8}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.charcoal} />
              </Pressable>


              {/* Search Box Input */}
              <AnimatedPressable
                style={styles.searchBox}
                onPress={() => onNavigate('explore')}
                scaleDown={0.985}
              >
                <View style={styles.searchInner}>
                  <Text style={styles.searchText} numberOfLines={1}>
                    Cari outfit, kain sisa, penjahit...
                  </Text>
                  <View style={styles.searchIconBg}>
                    <Feather name="search" size={14} color={colors.white} />
                  </View>
                </View>
              </AnimatedPressable>

              {/* Login / Auth State Button */}
              {!isLoggedIn ? (
                <AnimatedPressable
                  style={styles.loginBtn}
                  onPress={() => openAuthModal('Masuk ke akun CIRCULAI untuk belanja dan menukar poin.')}
                  scaleDown={0.95}
                >
                  <Feather name="log-in" size={14} color={colors.white} />
                  <Text style={styles.loginBtnText}>Masuk</Text>
                </AnimatedPressable>
              ) : (
                <View style={styles.headerActions}>
                  <View style={styles.cartWrap}>
                    <IconButton name="shopping-cart" variant="default" size="md" onPress={() => onNavigate('cart')} />
                    {!!cart.length && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cart.length}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Sub-header Location Bar */}
            <Pressable
              style={styles.locationBar}
              onPress={() => requireAuth(() => onNavigate('profile-addresses'), 'Masuk untuk mengelola alamat pengiriman.')}
            >
              <Feather name="map-pin" size={12} color={colors.warmGray} />
              <Text style={styles.locationText} numberOfLines={1}>
                {activeAddressLabel}
              </Text>
              <Feather name="chevron-down" size={12} color={colors.warmGray} />
            </Pressable>
          </View>
        </View>

        {/* ─── Hero Promo Slider (Blibli concept) ────────────────────────── */}
        <View style={styles.heroCarousel}>
          <Animated.ScrollView
            ref={heroScrollRef}
            horizontal
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              heroIsDragging.current = true;
            }}
            onScrollEndDrag={() => {
              heroIsDragging.current = false;
            }}
            onMomentumScrollEnd={handleHeroScrollEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: heroScrollX } } }],
              { useNativeDriver: true },
            )}
          >
            {heroSlides.map((slide, slideIndex) => (
              <View key={slide.id} style={[styles.heroSlide, { width: heroWidth }]}>
                <AnimatedPressable
                  style={styles.heroCard}
                  onPress={() => onNavigate(slide.route)}
                  scaleDown={0.985}
                >
                  <ImageBackground
                    source={{ uri: slide.image }}
                    style={styles.heroImageBg}
                    imageStyle={{ borderRadius: 20 }}
                  >
                    <View style={styles.heroGradientOverlay} />

                    <View style={styles.heroContent}>
                      <View style={styles.heroBadge}>
                        <MaterialCommunityIcons name={slide.badgeIcon} size={12} color={colors.sand} />
                        <Text style={styles.heroBadgeText}>{slide.badge}</Text>
                      </View>

                      <Text style={styles.heroTitle}>{slide.title}</Text>
                      <Text style={styles.heroCopy}>{slide.copy}</Text>

                      <View style={styles.heroButton}>
                        <Text style={styles.heroButtonText}>{slide.button}</Text>
                        <View style={styles.heroButtonArrow}>
                          <Feather name="arrow-right" size={13} color={colors.sand} />
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>
              </View>
            ))}
          </Animated.ScrollView>

          {/* Dots Indicator */}
          <View style={styles.heroDots}>
            {heroSlides.map((slide, dotIndex) => {
              const dotScale = heroScrollX.interpolate({
                inputRange: [
                  (dotIndex - 1) * heroWidth,
                  dotIndex * heroWidth,
                  (dotIndex + 1) * heroWidth,
                ],
                outputRange: [1, 2.6, 1],
                extrapolate: 'clamp',
              });
              const dotOpacity = heroScrollX.interpolate({
                inputRange: [
                  (dotIndex - 1) * heroWidth,
                  dotIndex * heroWidth,
                  (dotIndex + 1) * heroWidth,
                ],
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={slide.id}
                  style={[
                    styles.heroDot,
                    {
                      opacity: dotOpacity,
                      transform: [{ scaleX: dotScale }],
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* ─── Trust Badges ─────────────────────────────────────────── */}
        <TrustStrip />

        {/* ─── Service Grid Launcher ───────────────────────────────── */}
        <View style={styles.serviceGridContainer}>
          <View style={styles.serviceGrid}>
            {serviceIcons.map((service) => (
              <Pressable
                key={service.id}
                style={styles.serviceItem}
                onPress={() => {
                  if (service.route === 'passport-info') {
                    setScanModalVisible(true);
                  } else {
                    onNavigate(service.route);
                  }
                }}
              >
                <View style={[styles.serviceIconCircle, { backgroundColor: service.color + '14' }]}>
                  <MaterialCommunityIcons name={service.icon} size={22} color={service.color} />
                </View>
                <Text style={styles.serviceLabel} numberOfLines={1}>{service.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── Welcome Perk Card ────────────────────────────────────── */}
        <View style={styles.welcomePerkContainer}>
          <View style={styles.welcomePerkCard}>
            <View style={styles.welcomePerkLeft}>
              <View style={styles.welcomePerkIcon}>
                <LeafMark size={16} color={colors.forest} />
              </View>
              <View style={styles.welcomePerkText}>
                <Text style={styles.welcomePerkTitle}>Voucher Sambutan Sirkular</Text>
                <Text style={styles.welcomePerkSub}>Diskon Rp25.000 untuk pesanan pertamamu</Text>
                <View style={styles.welcomeCodeRow}>
                  <Text style={styles.welcomeCodeTag}>Kode: NUZ2026-25</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={[styles.copyBtn, copiedCode && styles.copyBtnDone]}
              onPress={copyPromoCode}
            >
              <Text style={[styles.copyBtnText, copiedCode && styles.copyBtnTextDone]}>
                {copiedCode ? 'Tersalin ✓' : 'Salin'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Kurasi Sirkular Terbatas (Curated Drops) ─────────────── */}
        <View style={styles.curationSection}>
          <View style={styles.curationInner}>
            <View style={styles.curationHeader}>
              <View style={styles.curationTitleRow}>
                <View style={styles.curationDot} />
                <Text style={styles.curationTitle}>Rilis Terbatas Atelier</Text>
                <View style={styles.curationTimerPill}>
                  <Feather name="clock" size={10} color={colors.forest} />
                  <Text style={styles.curationTimerText}>
                    {flashSaleTime.h}:{flashSaleTime.m}:{flashSaleTime.s}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => onNavigate('explore')}>
                <Text style={styles.curationSeeAll}>Lihat Semua</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.curationScroll}
            >
              {products.slice(0, 4).map((p) => {
                const stock = p.stock ?? 1;
                return (
                  <AnimatedPressable
                    key={p.id}
                    style={styles.curationCard}
                    onPress={() => onProductPress(p)}
                    scaleDown={0.97}
                  >
                    <ImageBackground
                      source={{ uri: p.image }}
                      style={styles.curationImg}
                      imageStyle={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
                    >
                      <View style={styles.curationBadge}>
                        <Text style={styles.curationBadgeText}>Upcycled</Text>
                      </View>
                    </ImageBackground>

                    <View style={styles.curationBody}>
                      <Text style={styles.curationProductTitle} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.curationProductPrice}>{formatCurrency(p.price)}</Text>
                      <View style={styles.curationMetaRow}>
                        <Text style={styles.curationStockText}>Sisa {stock} unit</Text>
                        <View style={styles.curationRating}>
                          <Feather name="star" size={10} color={colors.warning} />
                          <Text style={styles.curationRatingText}>{p.rating}</Text>
                        </View>
                      </View>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* ─── Category chips filter ─────────────────────────────────────── */}
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader
            title="Koleksi Busana Sirkular"
            action="Lihat Semua"
            onAction={() => onNavigate('explore')}
          />
        </View>

        <View style={styles.horizontalScrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ─── Featured Product Grid ─────────────────────────────────────── */}
        <View style={styles.productGrid}>
          {featuredProducts.slice(0, numCols * 2).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              grid
              slotStyle={cardSlotStyle}
              favorite={wishlist.includes(product.id)}
              onToggleFavorite={() => requireAuth(() => toggleWishlist(product.id), 'Masuk ke akun untuk menyimpan produk ke Wishlist.')}
              onPress={() => onProductPress(product)}
            />
          ))}
        </View>

        {/* ─── Local Tailor Spotlight ─────────────────────────────────────── */}
        <View style={styles.sectionHeaderWrap}>
          <SectionHeader title="Sorotan Penjahit Lokal" action="Lihat Semua" onAction={() => onNavigate('explore')} />
        </View>

        <View style={styles.horizontalScrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tailorRow}
          >
            {tailors.map((tailor) => (
              <AnimatedPressable
                key={tailor.id}
                style={styles.tailorCard}
                onPress={() => onTailorPress?.(tailor)}
                scaleDown={0.97}
              >
                <ImageBackground
                  source={{ uri: tailor.image }}
                  style={styles.tailorImage}
                  imageStyle={styles.tailorImageStyle}
                >
                  <View style={styles.tailorGradient} />
                  <View style={styles.tailorBadge}>
                    <MaterialCommunityIcons name="leaf" size={10} color={colors.white} />
                    <Text style={styles.tailorBadgeText}>Lokal</Text>
                  </View>
                </ImageBackground>
                <View style={styles.tailorInfo}>
                  <Text style={styles.tailorName} numberOfLines={1}>{tailor.name}</Text>
                  <View style={styles.tailorMeta}>
                    <Feather name="map-pin" size={11} color={colors.warmGray} />
                    <Text style={styles.tailorCity} numberOfLines={1}>{tailor.city}</Text>
                  </View>
                  <Text style={styles.tailorSpecialty} numberOfLines={2}>
                    {tailor.specialty}
                  </Text>
                  <View style={styles.tailorFooter}>
                    <View style={styles.tailorRating}>
                      <Feather name="star" size={11} color={colors.warning} />
                      <Text style={styles.tailorRatingText}>{tailor.rating}</Text>
                    </View>
                    <Text style={styles.tailorSold}>{tailor.sold} terjual</Text>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </View>

          {/* ─── UMKM Impact Banner ──────────────────────────────────────── */}
          <AnimatedPressable
            style={styles.umkmBanner}
            onPress={() => onNavigate('impact')}
            scaleDown={0.97}
          >
            <View style={styles.umkmBannerLeft}>
              <View style={styles.umkmBannerIcon}>
                <MaterialCommunityIcons name="account-group" size={22} color={colors.white} />
              </View>
              <View style={styles.umkmBannerText}>
                <Text style={styles.umkmBannerTitle}>134 Penjahit UMKM</Text>
                <Text style={styles.umkmBannerSub}>
                  Setiap pesanan memberdayakan artisan lokal Indonesia
                </Text>
              </View>
            </View>
            <View style={styles.umkmBannerArrow}>
              <Feather name="arrow-right" size={16} color={colors.white} />
            </View>
          </AnimatedPressable>


      </ScrollView>

      {/* ─── Digital Product Passport Scanner Camera Modal ────────────── */}
      <PassportScannerModal
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        orders={orders}
        products={products}
        onScannedPassport={(order) => {
          setScannedPassportOrder(order);
        }}
      />

      {/* ─── Scanned Passport Full Info Sheet ─────────────────────────── */}
      {!!scannedPassportOrder && (
        <PassportModal
          order={scannedPassportOrder}
          initialTab="passport"
          onClose={() => setScannedPassportOrder(null)}
        />
      )}
    </View>
  );
}

const trustBadges = [
  { icon: 'leaf', text: '100% Upcycled Fabric' },
  { icon: 'scissors-cutting', text: 'Artisan MTO Lokal' },
  { icon: 'shield-check', text: 'Garansi Ukuran Pas' },
  { icon: 'qrcode-scan', text: 'Paspor Digital DPP' },
];

function TrustStrip() {
  return (
    <View style={styles.trustStripContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trustStripContent}
      >
        {trustBadges.map((item, idx) => (
          <View key={idx} style={styles.trustBadgePill}>
            <MaterialCommunityIcons name={item.icon} size={13} color={colors.forest} />
            <Text style={styles.trustBadgeText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ImpactStat({ icon, value, label }) {
  return (
    <View style={styles.impactStat}>
      <View style={styles.impactStatIcon}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.forest} />
      </View>
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },
  // ─── Header Top ────────────────────────────────────────────────────────────
  topHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    width: '100%',
  },
  topHeaderInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  // ─── Section Header Wrapper ────────────────────────────────────────────────
  sectionHeaderWrap: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  // ─── Greeting Strip ────────────────────────────────────────────────────────
  greetingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  greetingText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  greetingImpactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sandLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  greetingImpactText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory,
  },
  searchBox: {
    flex: 1,
  },
  searchInner: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ivory,
    borderWidth: 1,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 4,
    justifyContent: 'space-between',
  },
  searchText: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  searchIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    ...shadows.sm,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cartWrap: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -3,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.ivory,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  locationText: {
    flex: 1,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '600',
  },
  // ─── Hero Carousel ────────────────────────────────────────────────────────
  heroCarousel: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 12,
    overflow: 'hidden',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroSlide: {
    minHeight: 180,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  heroCard: {
    width: '100%',
    minHeight: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.forest,
    ...shadows.md,
  },
  heroImageBg: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 43, 33, 0.65)',
    borderRadius: 20,
  },
  heroContent: {
    width: '88%',
    minHeight: 180,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    zIndex: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 4,
  },
  heroBadgeText: {
    color: colors.sand,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  heroButtonText: {
    color: colors.sand,
    fontSize: 11,
    fontWeight: '900',
  },
  heroButtonArrow: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  heroDots: {
    position: 'absolute',
    left: 28,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.sand,
  },
  // ─── Trust Badges ─────────────────────────────────────────────────────────
  trustStripContainer: {
    paddingVertical: 8,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  trustStripContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  trustBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },

  // ─── Service Grid ─────────────────────────────────────────────────────────
  serviceGridContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
    gap: 5,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
  },

  // ─── Welcome Perk Card ───────────────────────────────────────────────────
  welcomePerkContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  welcomePerkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  welcomePerkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  welcomePerkIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomePerkText: {
    flex: 1,
  },
  welcomePerkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.charcoal,
  },
  welcomePerkSub: {
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 2,
  },
  welcomeCodeRow: {
    marginTop: 4,
  },
  welcomeCodeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: 0.3,
  },
  copyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: colors.forest,
  },
  copyBtnDone: {
    backgroundColor: colors.successLight,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  copyBtnTextDone: {
    color: colors.success,
  },

  // ─── Curation Section ────────────────────────────────────────────────────
  curationSection: {
    backgroundColor: colors.sandLight,
    paddingVertical: 16,
    marginVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    width: '100%',
  },
  curationInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  curationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  curationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  curationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.forest,
  },
  curationTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
  },
  curationTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  curationTimerText: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
  },
  curationSeeAll: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800',
  },
  curationScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  curationCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
    ...shadows.sm,
  },
  curationImg: {
    height: 120,
    justifyContent: 'flex-start',
    backgroundColor: colors.sand,
  },
  curationBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignSelf: 'flex-start',
    margin: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
  },
  curationBadgeText: {
    color: colors.forest,
    fontSize: 8,
    fontWeight: '800',
  },
  curationBody: {
    padding: 10,
    gap: 2,
  },
  curationProductTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  curationProductPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.forest,
  },
  curationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  curationStockText: {
    fontSize: 10,
    color: colors.warmGray,
  },
  curationRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  curationRatingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
  },

  // ─── Categories & Product Grid ──────────────────────────────────────────────
  horizontalScrollWrap: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 6,
  },
  categoryRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  chip: {
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  chipActive: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  chipText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  // ─── Tailors ───────────────────────────────────────────────────────────────
  tailorRow: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tailorCard: {
    width: 185,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  tailorImage: {
    height: 110,
    justifyContent: 'flex-end',
    padding: 8,
  },
  tailorImageStyle: {
    backgroundColor: colors.sand,
  },
  tailorGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,36,33,0.25)',
  },
  tailorBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(47,79,58,0.85)',
  },
  tailorBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tailorInfo: {
    padding: 10,
  },
  tailorName: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
  },
  tailorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  tailorCity: {
    color: colors.warmGray,
    fontSize: 10,
    flex: 1,
  },
  tailorSpecialty: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 4,
  },
  tailorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tailorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  tailorRatingText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
  tailorSold: {
    color: colors.warmGray,
    fontSize: 10,
  },
  // ─── UMKM Banner ──────────────────────────────────────────────────────────
  umkmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ming,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 6,
    maxWidth: 1200,
    width: 'calc(100% - 32px)',
    alignSelf: 'center',
    ...shadows.sm,
  },
  umkmBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  umkmBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  umkmBannerText: {
    flex: 1,
  },
  umkmBannerTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  umkmBannerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  umkmBannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  // ─── Impact Dashboard ──────────────────────────────────────────────────────
  impactCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    ...shadows.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  impactIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    flexShrink: 0,
  },
  impactTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  impactCopy: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 15,
  },
  impactDivider: {
    height: 1,
    backgroundColor: 'rgba(122,122,114,0.20)',
    marginBottom: 12,
  },
  impactStats: {
    flexDirection: 'row',
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  impactStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,79,58,0.10)',
    marginBottom: 2,
  },
  impactStatDivider: {
    width: 1,
    backgroundColor: 'rgba(122,122,114,0.20)',
  },
  impactValue: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  impactLabel: {
    color: colors.warmGray,
    fontSize: 9,
    lineHeight: 12,
    textAlign: 'center',
  },
  // ─── Scan Modal ────────────────────────────────────────────────────────────
  scanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31,36,33,0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanModalContent: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  scanHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.forest,
  },
  qrPlaceholderBox: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: colors.ivory,
    borderWidth: 2,
    borderColor: colors.forestAlpha20,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 10,
  },
  qrText: {
    fontSize: 11,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  qrDesc: {
    fontSize: 11,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 14,
  },
  closeScanBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  closeScanBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
});
