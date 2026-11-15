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
  Image,
  ImageBackground,
  Modal,
  Platform,
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

const LOGO = require('../../assets/images/fashionku_icon_transparent.png');

const serviceIcons = [
  { id: 'bespoke', label: 'Bespoke', icon: 'scissors-cutting', color: colors.forest, route: 'custom-design' },
  { id: 'quiz', label: 'AI Stylist', icon: 'creation', color: colors.ming, route: 'quiz' },
  { id: 'exchange', label: 'Eco Swap', icon: 'recycle', color: colors.forest, route: 'exchange' },
  { id: 'mto', label: 'Koleksi MTO', icon: 'hanger', color: colors.indigoDye, route: 'explore' },
  { id: 'tailor', label: 'Penjahit', icon: 'account-group-outline', color: colors.forestMid, route: 'explore' },
  { id: 'passport', label: 'Paspor DPP', icon: 'qrcode-scan', color: colors.forest, route: 'passport-info' },
  { id: 'voucher', label: 'Poin Sirkular', icon: 'tag-multiple-outline', color: colors.ming, route: 'exchange' },
  { id: 'flash', label: 'Kurasi Spesial', icon: 'star-outline', color: colors.forest, route: 'explore' },
];

export default function HomeScreen({ isActive = true, onNavigate, onProductPress, onTailorPress, onExchange }) {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;
  const maxContentWidth = Math.min(screenWidth, 1200);
  const containerPadding = 16;
  const availableWidth = maxContentWidth - (containerPadding * 2);
  const heroWidth = availableWidth;
  const heroHeight = isDesktop ? 280 : 180;
  const numCols = isDesktop ? (screenWidth >= 1200 ? 5 : 4) : 2;
  const gridGap = isDesktop ? 16 : 10;
  const cardWidth = Math.floor((availableWidth - (numCols - 1) * gridGap) / numCols);
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
        {/* ─── Shopee / Tokopedia Style Header ────────────────────────── */}
        <View style={styles.topHeader}>
          {/* Top Utility Bar (Desktop only, like Tokopedia & Shopee) */}
          {isDesktop && (
            <View style={styles.topUtilityBar}>
              <View style={styles.topUtilityInner}>
                <View style={styles.utilityLeft}>
                  <Text style={styles.utilityLink}>Tentang FashionKu</Text>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Text style={styles.utilityLink}>Mitra Penjahit UMKM</Text>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Text style={styles.utilityLink}>Download App</Text>
                </View>
                <View style={styles.utilityRight}>
                  <Pressable style={styles.utilityPill} onPress={() => onNavigate('impact')}>
                    <MaterialCommunityIcons name="leaf" size={12} color={colors.forest} />
                    <Text style={styles.utilityPillText}>{circularPoints} Poin Sirkular</Text>
                  </Pressable>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Pressable onPress={() => onNavigate('orders')}>
                    <Text style={styles.utilityLink}>Lacak Pesanan</Text>
                  </Pressable>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Text style={styles.utilityLink}>Bantuan</Text>
                </View>
              </View>
            </View>
          )}

          {/* Main Header Container */}
          <View style={styles.topHeaderInner}>
            <View style={styles.mainHeaderRow}>
              {/* Brand Logo & Name */}
              <Pressable style={styles.brandContainer} onPress={() => onNavigate('home')}>
                <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
                <View style={styles.brandTextGroup}>
                  <Text style={styles.brandTitleText}>FashionKu</Text>
                  {isDesktop && <Text style={styles.brandTaglineText}>Sirkular Fashion</Text>}
                </View>
              </Pressable>

              {/* Shopee / Tokopedia Search Box */}
              <View style={styles.searchSection}>
                <AnimatedPressable
                  style={styles.searchBox}
                  onPress={() => onNavigate('explore')}
                  scaleDown={0.99}
                >
                  <View style={styles.searchInner}>
                    <Feather name="search" size={15} color={colors.warmGray} style={styles.searchIconLeft} />
                    <Text style={styles.searchText} numberOfLines={1}>
                      {isDesktop ? 'Cari outfit upcycled, dress kain sisa, penjahit Jogja...' : 'Cari busana sirkular...'}
                    </Text>
                    {isDesktop && (
                      <View style={styles.searchSubmitBtn}>
                        <Text style={styles.searchSubmitText}>Cari</Text>
                      </View>
                    )}
                  </View>
                </AnimatedPressable>

                {/* Quick Keywords (Desktop only) */}
                {isDesktop && (
                  <View style={styles.quickKeywordsRow}>
                    {['Kain Sisa', 'Outer Linen', 'Batik Upcycled', 'Zero Waste', 'Penjahit Lokal'].map((kw) => (
                      <Pressable key={kw} onPress={() => onNavigate('explore')}>
                        <Text style={styles.quickKeyword}>{kw}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Right Action Icons: Scan QR, Wishlist, Cart, Profile */}
              <View style={styles.headerRightActions}>
                {/* Paspor DPP QR Scan */}
                <Pressable
                  style={styles.headerActionBtn}
                  onPress={() => setScanModalVisible(true)}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.charcoal} />
                  {isDesktop && <Text style={styles.actionBtnLabel}>Paspor</Text>}
                </Pressable>

                {/* Wishlist (Desktop only) */}
                {isDesktop && (
                  <Pressable
                    style={styles.headerActionBtn}
                    onPress={() => onNavigate('explore', { wishlistOnly: true })}
                    hitSlop={8}
                  >
                    <Feather name="heart" size={20} color={colors.charcoal} />
                    <Text style={styles.actionBtnLabel}>Favorit</Text>
                  </Pressable>
                )}

                {/* Cart (Keranjang) — ALWAYS VISIBLE! */}
                <Pressable
                  style={styles.headerActionBtn}
                  onPress={() => onNavigate('cart')}
                  hitSlop={8}
                >
                  <View style={styles.cartIconWrapper}>
                    <Feather name="shopping-bag" size={20} color={colors.forest} />
                    {cart.length > 0 && (
                      <View style={styles.cartCountBadge}>
                        <Text style={styles.cartCountText}>{cart.length}</Text>
                      </View>
                    )}
                  </View>
                  {isDesktop && <Text style={styles.actionBtnLabel}>Keranjang</Text>}
                </Pressable>

                {/* User Auth / Profile (Desktop only) */}
                {isDesktop && (
                  !isLoggedIn ? (
                    <AnimatedPressable
                      style={styles.headerLoginBtn}
                      onPress={() => openAuthModal('Masuk ke akun FashionKu untuk belanja dan menukar poin.')}
                      scaleDown={0.96}
                    >
                      <Text style={styles.headerLoginText}>Masuk</Text>
                    </AnimatedPressable>
                  ) : (
                    <Pressable style={styles.headerUserBtn} onPress={() => onNavigate('profile')}>
                      <View style={styles.userAvatarSmall}>
                        <Text style={styles.userAvatarInitial}>
                          {(userProfile?.name || 'A')[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.userNameHeader} numberOfLines={1}>
                        {userProfile?.name?.split(' ')?.[0] || 'Akun'}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>

            {/* Desktop Navigation Category Strip (Tokopedia Style) */}
            {isDesktop && (
              <View style={styles.desktopNavStrip}>
                <Pressable style={[styles.navTabItem, styles.navTabItemActive]} onPress={() => onNavigate('home')}>
                  <MaterialCommunityIcons name="home-variant" size={16} color={colors.forest} />
                  <Text style={[styles.navTabText, styles.navTabTextActive]}>Beranda</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('explore')}>
                  <MaterialCommunityIcons name="hanger" size={16} color={colors.charcoal} />
                  <Text style={styles.navTabText}>Katalog Busana</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('quiz')}>
                  <MaterialCommunityIcons name="creation" size={16} color={colors.forest} />
                  <Text style={styles.navTabText}>AI Stylist Pintar</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('explore')}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.charcoal} />
                  <Text style={styles.navTabText}>Mitra Penjahit</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('exchange')}>
                  <MaterialCommunityIcons name="recycle" size={16} color={colors.charcoal} />
                  <Text style={styles.navTabText}>Eco Swap</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('impact')}>
                  <MaterialCommunityIcons name="leaf" size={16} color={colors.charcoal} />
                  <Text style={styles.navTabText}>Dampak Lingkungan</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('orders')}>
                  <MaterialCommunityIcons name="package-variant-closed" size={16} color={colors.charcoal} />
                  <Text style={styles.navTabText}>Pesanan Saya</Text>
                </Pressable>
              </View>
            )}

            {/* Sub-header Location Bar */}
            <Pressable
              style={styles.locationBar}
              onPress={() => requireAuth(() => onNavigate('profile-addresses'), 'Masuk untuk mengelola alamat pengiriman.')}
            >
              <Feather name="map-pin" size={12} color={colors.warmGray} />
              <Text style={styles.locationText} numberOfLines={1}>
                Dikirim ke: <Text style={{ fontWeight: '700', color: colors.charcoal }}>{activeAddressLabel}</Text>
              </Text>
              <Feather name="chevron-down" size={12} color={colors.warmGray} />
            </Pressable>
          </View>
        </View>

        {/* ─── Hero Promo Banner (Unified & 100% Responsive) ─────────────── */}
        <View style={styles.heroOuterContainer}>
          <View style={[styles.heroCarousel, { width: heroWidth, height: heroHeight }]}>
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
              {heroSlides.map((slide) => (
                <View key={slide.id} style={{ width: heroWidth, height: heroHeight }}>
                  <AnimatedPressable
                    style={{ width: heroWidth, height: heroHeight, borderRadius: 16, overflow: 'hidden' }}
                    onPress={() => onNavigate(slide.route)}
                    scaleDown={0.99}
                  >
                    <ImageBackground
                      source={{ uri: slide.image }}
                      style={{ width: '100%', height: '100%', justifyContent: 'center' }}
                      imageStyle={{ borderRadius: 16 }}
                      resizeMode="cover"
                    >
                      <View style={styles.heroGradientOverlay} />

                      <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                        <View style={styles.heroBadge}>
                          <MaterialCommunityIcons name={slide.badgeIcon} size={12} color="#DDEB9D" />
                          <Text style={styles.heroBadgeText}>{slide.badge}</Text>
                        </View>

                        <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>{slide.title}</Text>
                        <Text style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>{slide.copy}</Text>

                        <View style={styles.heroButton}>
                          <Text style={styles.heroButtonText}>{slide.button}</Text>
                          <View style={styles.heroButtonArrow}>
                            <Feather name="arrow-right" size={13} color="#FFFFFF" />
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
        </View>

        {/* ─── Trust Badges ─────────────────────────────────────────── */}
        <TrustStrip />

        {/* ─── Duo Promo Highlights (Tokopedia / Shopee Style) ─────────────── */}
        <View style={[styles.duoPromoContainer, isDesktop && styles.duoPromoContainerDesktop]}>
          <AnimatedPressable
            style={[styles.duoPromoCard, isDesktop && styles.duoPromoCardDesktop]}
            onPress={() => onNavigate('exchange')}
            scaleDown={0.98}
          >
            <ImageBackground
              source={{ uri: products[4]?.image || heroSlides[1].image }}
              style={styles.duoPromoImg}
              imageStyle={{ borderRadius: 12 }}
              resizeMode="cover"
            >
              <View style={styles.duoPromoOverlay} />
              <View style={styles.duoPromoContent}>
                <View style={styles.duoPromoBadge}>
                  <Text style={styles.duoPromoBadgeText}>🔥 EKSTRA 100 POIN</Text>
                </View>
                <Text style={styles.duoPromoTitle}>Tukar Baju Jadi Voucher</Text>
                <Text style={styles.duoPromoSub}>Daur ulang pakaian lama tanpa ribet</Text>
              </View>
            </ImageBackground>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.duoPromoCard, isDesktop && styles.duoPromoCardDesktop]}
            onPress={() => onNavigate('custom-design')}
            scaleDown={0.98}
          >
            <ImageBackground
              source={{ uri: products[3]?.image || heroSlides[0].image }}
              style={styles.duoPromoImg}
              imageStyle={{ borderRadius: 12 }}
              resizeMode="cover"
            >
              <View style={styles.duoPromoOverlay} />
              <View style={styles.duoPromoContent}>
                <View style={[styles.duoPromoBadge, { backgroundColor: '#1E4D2B' }]}>
                  <Text style={styles.duoPromoBadgeText}>✂️ BESPOKE ATELIER</Text>
                </View>
                <Text style={styles.duoPromoTitle}>Jahit Kustom Presisi</Text>
                <Text style={styles.duoPromoSub}>100% dibuat khusus sesuai ukuranmu</Text>
              </View>
            </ImageBackground>
          </AnimatedPressable>
        </View>

        {/* ─── Service Grid Launcher (Shopee Style) ─────────────────── */}
        <View style={styles.serviceGridContainer}>
          <View style={[styles.serviceGrid, isDesktop && styles.serviceGridDesktop]}>
            {serviceIcons.map((service) => (
              <Pressable
                key={service.id}
                style={[styles.serviceItem, isDesktop && styles.serviceItemDesktop]}
                onPress={() => {
                  if (service.route === 'passport-info') {
                    setScanModalVisible(true);
                  } else {
                    onNavigate(service.route);
                  }
                }}
              >
                <View style={[styles.serviceIconCircle, isDesktop && styles.serviceIconCircleDesktop, { backgroundColor: service.color + '14' }]}>
                  <MaterialCommunityIcons name={service.icon} size={isDesktop ? 24 : 20} color={service.color} />
                </View>
                <Text style={[styles.serviceLabel, isDesktop && styles.serviceLabelDesktop]} numberOfLines={1}>{service.label}</Text>
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

        {/* ─── Kurasi Sirkular Terbatas (Shopee Flash Sale Style) ──────── */}
        <View style={styles.curationSection}>
          <View style={styles.curationInner}>
            <View style={styles.curationHeader}>
              <View style={styles.curationTitleRow}>
                <MaterialCommunityIcons name="fire" size={22} color="#EA580C" />
                <Text style={styles.curationTitle}>RILIS TERBATAS ATELIER</Text>
                <View style={styles.flashCountdownRow}>
                  <View style={styles.timerBlock}><Text style={styles.timerBlockText}>{flashSaleTime.h}</Text></View>
                  <Text style={styles.timerColon}>:</Text>
                  <View style={styles.timerBlock}><Text style={styles.timerBlockText}>{flashSaleTime.m}</Text></View>
                  <Text style={styles.timerColon}>:</Text>
                  <View style={styles.timerBlock}><Text style={styles.timerBlockText}>{flashSaleTime.s}</Text></View>
                </View>
              </View>
              <Pressable onPress={() => onNavigate('explore')}>
                <Text style={styles.curationSeeAll}>Lihat Semua &gt;</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.curationScroll}
            >
              {products.slice(0, 6).map((p) => {
                const stock = p.stock ?? 1;
                const originalPrice = Math.round(p.price * 1.35);
                return (
                  <AnimatedPressable
                    key={p.id}
                    style={[styles.curationCard, isDesktop && styles.curationCardDesktop]}
                    onPress={() => onProductPress(p)}
                    scaleDown={0.97}
                  >
                    <ImageBackground
                      source={{ uri: p.image }}
                      style={[styles.curationImg, isDesktop && styles.curationImgDesktop]}
                      imageStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                    >
                      <View style={styles.curationDiscountBadge}>
                        <Text style={styles.curationDiscountText}>-35%</Text>
                      </View>
                    </ImageBackground>

                    <View style={styles.curationBody}>
                      <Text style={styles.curationProductTitle} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.curationProductPrice}>{formatCurrency(p.price)}</Text>
                      <Text style={styles.curationOriginalPrice}>{formatCurrency(originalPrice)}</Text>
                      <View style={styles.curationStockBar}>
                        <View style={[styles.curationStockFill, { width: `${Math.min(100, (15 - stock) * 8 + 30)}%` }]} />
                        <Text style={styles.curationStockText}>
                          🔥 SEGERA HABIS ({stock} unit)
                        </Text>
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
        <View style={[styles.productGrid, { gap: gridGap, paddingHorizontal: containerPadding }]}>
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

        {/* ─── Shopee / Tokopedia Style Desktop Footer ────────────────────── */}
        {isDesktop && (
          <View style={styles.desktopFooter}>
            <View style={styles.desktopFooterInner}>
              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>Layanan Pelanggan</Text>
                <Text style={styles.footerLink}>Pusat Bantuan</Text>
                <Text style={styles.footerLink}>Cara Pembelian</Text>
                <Text style={styles.footerLink}>Pengiriman & Tarif</Text>
                <Text style={styles.footerLink}>Garansi Ukuran Pas</Text>
                <Text style={styles.footerLink}>Pengembalian Barang</Text>
              </View>

              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>Jelajahi FashionKu</Text>
                <Text style={styles.footerLink}>Tentang Kami</Text>
                <Text style={styles.footerLink}>Mitra Penjahit UMKM</Text>
                <Text style={styles.footerLink}>Paspor Digital DPP</Text>
                <Text style={styles.footerLink}>Dampak Lingkungan</Text>
                <Text style={styles.footerLink}>Karir & Komunitas</Text>
              </View>

              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>Pembayaran</Text>
                <View style={styles.footerBadgeWrap}>
                  {['QRIS', 'BCA', 'Mandiri', 'BNI', 'BRI', 'GoPay', 'OVO'].map((pay) => (
                    <View key={pay} style={styles.footerPayBadge}>
                      <Text style={styles.footerPayText}>{pay}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.footerColTitle, { marginTop: 14 }]}>Pengiriman</Text>
                <View style={styles.footerBadgeWrap}>
                  {['JNE', 'SiCepat', 'J&T', 'GoSend', 'AnterAja'].map((courier) => (
                    <View key={courier} style={styles.footerPayBadge}>
                      <Text style={styles.footerPayText}>{courier}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.footerColWide}>
                <View style={styles.footerBrandRow}>
                  <Image source={LOGO} style={styles.footerBrandLogo} resizeMode="contain" />
                  <Text style={styles.footerBrandName}>FashionKu</Text>
                </View>
                <Text style={styles.footerBrandDesc}>
                  Platform e-commerce fesyen sirkular terdepan Indonesia. Menghubungkan pembeli dengan artisan penjahit lokal untuk menghasilkan pakaian bespoke ramah lingkungan dengan transparansi Digital Product Passport (DPP).
                </Text>
                <View style={styles.footerCertBadge}>
                  <MaterialCommunityIcons name="shield-check" size={16} color="#2C6842" />
                  <Text style={styles.footerCertText}>100% Terverifikasi Ramah Lingkungan & DPP Certified</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerBottomBar}>
              <Text style={styles.footerCopyright}>
                © 2026 FashionKu by CIRCULAI. Platform Fesyen Sirkular & Bespoke Indonesia. Hak Cipta Dilindungi.
              </Text>
            </View>
          </View>
        )}


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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    width: '100%',
    ...shadows.sm,
  },
  topUtilityBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBF6',
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 6,
    width: '100%',
  },
  topUtilityInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  utilityLink: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  utilityDivider: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  utilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#C6E7CE',
  },
  utilityPillText: {
    fontSize: 11,
    color: '#20603D',
    fontWeight: '700',
  },
  topHeaderInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 4,
  },
  mainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 6,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2C6842',
    letterSpacing: -0.6,
  },
  brandTaglineText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6A7D87',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  searchSection: {
    flex: 1,
    maxWidth: 620,
  },
  searchBox: {
    width: '100%',
  },
  searchInner: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2C6842',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 3,
    justifyContent: 'space-between',
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  searchSubmitBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 7,
    backgroundColor: '#2C6842',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  quickKeywordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingLeft: 4,
  },
  quickKeyword: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    right: -8,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  headerLoginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2C6842',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLoginText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  headerUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C6842',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  userNameHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  desktopNavStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  navTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navTabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2C6842',
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  navTabTextActive: {
    color: '#2C6842',
    fontWeight: '800',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 2,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  heroTitleDesktop: {
    fontSize: 26,
    lineHeight: 34,
  },
  heroCopyDesktop: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 520,
  },
  flashCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerBlock: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  timerBlockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  timerColon: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E293B',
  },
  curationCardDesktop: {
    width: 175,
  },
  curationImgDesktop: {
    height: 145,
  },
  curationDiscountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  curationDiscountText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '900',
  },
  curationStockBar: {
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 6,
    justifyContent: 'center',
  },
  curationStockFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FDE047',
    borderRadius: 7,
  },
  curationOriginalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },

  // ─── Hero Outer Container & Duo Promo ─────────────────────────────────────
  heroOuterContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  heroContentDesktop: {
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  duoPromoContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  duoPromoContainerDesktop: {
    gap: 14,
  },
  duoPromoCard: {
    flex: 1,
    height: 105,
    borderRadius: 14,
    overflow: 'hidden',
    ...shadows.sm,
  },
  duoPromoCardDesktop: {
    height: 135,
  },
  duoPromoImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  duoPromoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderRadius: 14,
  },
  duoPromoContent: {
    padding: 12,
    zIndex: 2,
  },
  duoPromoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  duoPromoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  duoPromoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  duoPromoSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 10,
    fontWeight: '500',
  },
  sectionHeaderWrap: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 4,
  },

  // ─── Service Grid Desktop ──────────────────────────────────────────────────
  serviceGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  serviceItemDesktop: {
    width: '12%',
    alignItems: 'center',
  },
  serviceIconCircleDesktop: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  serviceLabelDesktop: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },

  // ─── Desktop Footer ───────────────────────────────────────────────────────
  desktopFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 40,
    paddingTop: 36,
    paddingBottom: 24,
    width: '100%',
  },
  desktopFooterInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 32,
    flexWrap: 'wrap',
  },
  footerCol: {
    flex: 1,
    minWidth: 160,
  },
  footerColWide: {
    flex: 1.6,
    minWidth: 260,
  },
  footerColTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerLink: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  footerBadgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerPayBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footerPayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  footerBrandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  footerBrandName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2C6842',
  },
  footerBrandDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  footerCertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C6E7CE',
    alignSelf: 'flex-start',
  },
  footerCertText: {
    fontSize: 11,
    color: '#2C6842',
    fontWeight: '700',
  },
  footerBottomBar: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // ─── Hero Carousel ────────────────────────────────────────────────────────
  heroCarousel: {
    position: 'relative',
    overflow: 'hidden',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 16,
  },
  heroSlide: {
    overflow: 'hidden',
  },
  heroCard: {
    width: '100%',
    borderRadius: 16,
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
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
