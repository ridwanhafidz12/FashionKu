/**
 * @file HomeScreen.js
 * @description Landing screen for FashionKu with brand green palette (#2C6842)
 * and Shopee-grade structural layout & responsive design system.
 *
 * Features:
 * - Clean white sticky header with brand Forest Green (#2C6842) accents & search bar
 * - Desktop side-by-side Hero (66.5% Carousel + 33.5% Stacked Promo Banners)
 * - 10-Icon Circular Service Launcher (Shopee circle menu in brand palette)
 * - Flash Sale section with countdown timer blocks, discount badges, and progress bar
 * - FashionKu Mall (Forest Green header, 100% original, official ateliers)
 * - Kategori Pilihan (8 visual category cards)
 * - Rekomendasi (Daily Discover tab bar + 5-column desktop / 2-column mobile grid)
 * - Floating Chat widget on desktop (#2C6842)
 * - 5-column comprehensive footer
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

// ─── 10-Icon Circular Service Launcher (Vibrant Shopee-Grade Icons) ───────────
const serviceIcons = [
  { id: 'bespoke', label: 'Bespoke\nKustom', icon: 'scissors-cutting', color: '#059669', bg: '#ECFDF5', route: 'custom-design' },
  { id: 'quiz', label: 'AI Stylist\nPintar', icon: 'creation', color: '#7C3AED', bg: '#F5F3FF', route: 'quiz' },
  { id: 'exchange', label: 'Eco Swap\nTukar Baju', icon: 'recycle', color: '#2C6842', bg: '#EDF7EE', route: 'exchange' },
  { id: 'mto', label: 'Koleksi\nMade-To-Order', icon: 'hanger', color: '#0284C7', bg: '#F0F9FF', route: 'explore' },
  { id: 'tailor', label: 'Mitra\nPenjahit UMKM', icon: 'account-group-outline', color: '#D97706', bg: '#FFFBEB', route: 'explore' },
  { id: 'passport', label: 'Paspor DPP\nDigital QR', icon: 'qrcode-scan', color: '#047857', bg: '#ECFDF5', route: 'passport-info' },
  { id: 'voucher', label: 'Poin Sirkular\n& Hadiah', icon: 'tag-multiple-outline', color: '#EA580C', bg: '#FFF7ED', route: 'exchange' },
  { id: 'shipping', label: 'Gratis Ongkir\nXTRA', icon: 'truck-fast-outline', color: '#00897B', bg: '#E0F2F1', route: 'explore' },
  { id: 'guarantee', label: 'Garansi Pas\n100% Cocok', icon: 'shield-check-outline', color: '#2563EB', bg: '#EFF6FF', route: 'explore' },
  { id: 'flash', label: 'Kurasi Spesial\nDiskon 60%', icon: 'star-outline', color: '#DC2626', bg: '#FEF2F2', route: 'explore' },
];

// ─── Visual Category Thumbnails (Ultra-HD Guaranteed CDN Images) ───────────────
const shopeeCategories = [
  { id: 'c1', label: 'Atasan Wanita', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c2', label: 'Kemeja Pria', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c3', label: 'Dress Batik', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c4', label: 'Outer & Blazer', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c5', label: 'Kain Sisa Kiloan', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c6', label: 'Bespoke Kustom', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=300&h=300&q=85', route: 'custom-design' },
  { id: 'c7', label: 'Aksesoris Etnik', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c8', label: 'Baju Anak', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c9', label: 'Linen Premium', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
  { id: 'c10', label: 'Zero Waste Pack', image: 'https://images.unsplash.com/photo-1542295669297-4d352b042bca?auto=format&fit=crop&w=300&h=300&q=85', route: 'explore' },
];

export default function HomeScreen({ isActive = true, onNavigate, onProductPress, onTailorPress, onExchange }) {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;
  const maxContentWidth = isDesktop ? Math.min(screenWidth - 32, 1680) : screenWidth;
  const containerPadding = isDesktop ? 16 : 12;
  const availableWidth = maxContentWidth - (containerPadding * 2);

  // Exact desktop ratio: 66.5% main carousel, 33.5% stacked promo banners
  const heroWidth = isDesktop ? Math.floor(availableWidth * 0.665) : availableWidth;
  const heroRightWidth = isDesktop ? availableWidth - heroWidth - 12 : availableWidth;
  const heroHeight = isDesktop ? (screenWidth >= 1500 ? 320 : screenWidth >= 1200 ? 285 : 260) : 180;

  const numCols = isDesktop ? (screenWidth >= 1500 ? 6 : screenWidth >= 1200 ? 5 : 4) : 2;
  const gridGap = isDesktop ? 12 : 8;
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
    userProfile,
    openAuthModal,
    requireAuth,
    addresses,
    selectedAddress,
    setNotice,
    backend,
  } = useAppState();

  const heroSlides = useMemo(() => {
    const bannerImg1 = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85';
    const bannerImg2 = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=85';
    const bannerImg3 = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1920&q=85';

    return [
      {
        id: 'circular-sale',
        badge: 'Circular Super Sale',
        badgeIcon: 'recycle',
        title: 'Diskon s.d. 60%\n+ Extra Poin Daur Ulang',
        copy: 'Kain sisa atelier pilihan dengan potongan harga terbesar bulan ini.',
        button: 'Belanja Sekarang',
        route: 'explore',
        image: bannerImg1,
      },
      {
        id: 'bespoke-studio',
        badge: 'Bespoke Atelier',
        badgeIcon: 'scissors-cutting',
        title: 'Made For You,\nNot For Landfill',
        copy: 'Desain kustom baju buatan penjahit lokal sesuai ukuran tubuhmu.',
        button: 'Coba Bespoke Studio',
        route: 'custom-design',
        image: bannerImg2,
      },
      {
        id: 'ai-stylist',
        badge: 'AI Smart Stylist',
        badgeIcon: 'lightning-bolt',
        title: 'Find Your\nPersonal Palette',
        copy: 'Rekomendasi outfit cocok dengan warna kulit & bentuk tubuhmu.',
        button: 'Coba AI Stylist',
        route: 'quiz',
        image: bannerImg3,
      },
    ];
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await backend.refresh();
    } catch {
      // Refresh failed silently
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

  const copyPromoCode = async () => {
    try {
      await Share.share({ message: 'FASHIONKU25' });
    } catch {
      // silently ignore
    }
    setCopiedCode(true);
    setNotice('Kode voucher berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const activeAddress = selectedAddress ?? addresses?.[0];
  const activeAddressLabel = activeAddress?.detail
    ? `${activeAddress.label} — ${activeAddress.detail}`
    : 'Tambah alamat biar belanja lebih asyik';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F6F8' }}>
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
        {/* ─── Header: Clean Modern Desktop & Mobile (Brand Green Palette) ── */}
        <View style={styles.topHeader}>
          {/* Top Utility Bar (Desktop only) */}
          {isDesktop && (
            <View style={styles.topUtilityBar}>
              <View style={styles.topUtilityInner}>
                <View style={styles.utilityLeft}>
                  <Text style={styles.utilityLink}>Tentang FashionKu</Text>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Text style={styles.utilityLink}>Mitra Penjahit UMKM</Text>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Text style={styles.utilityLink}>Download Aplikasi</Text>
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
                <View style={styles.brandLogoCard}>
                  <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
                </View>
                <View style={styles.brandTextGroup}>
                  <Text style={styles.brandTitleText}>FashionKu</Text>
                  {isDesktop && <Text style={styles.brandTaglineText}>Sirkular Fashion</Text>}
                </View>
              </Pressable>

              {/* Big Search Box with Forest Green Search Button */}
              <View style={styles.searchSection}>
                <AnimatedPressable
                  style={styles.searchBox}
                  onPress={() => onNavigate('explore')}
                  scaleDown={0.99}
                >
                  <View style={styles.searchInner}>
                    <Feather name="search" size={15} color="#64748B" style={styles.searchIconLeft} />
                    <Text style={styles.searchText} numberOfLines={1}>
                      {isDesktop ? 'Cari outfit upcycled, dress kain sisa, penjahit Jogja...' : 'Cari di FashionKu...'}
                    </Text>
                    <View style={styles.searchSubmitBtn}>
                      <Feather name="search" size={14} color="#FFFFFF" style={{ marginRight: isDesktop ? 4 : 0 }} />
                      {isDesktop && <Text style={styles.searchSubmitText}>Cari</Text>}
                    </View>
                  </View>
                </AnimatedPressable>

                {/* Quick Trending Keywords under Search Box (Desktop only) */}
                {isDesktop && (
                  <View style={styles.quickKeywordsRow}>
                    {['Kain Sisa', 'Outer Linen', 'Batik Upcycled', 'Zero Waste', 'Penjahit Lokal', 'Dress MTO'].map((kw) => (
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
                  <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" />
                  {isDesktop && <Text style={styles.actionBtnLabel}>Paspor</Text>}
                </Pressable>

                {/* Wishlist (Desktop only) */}
                {isDesktop && (
                  <Pressable
                    style={styles.headerActionBtn}
                    onPress={() => onNavigate('explore', { wishlistOnly: true })}
                    hitSlop={8}
                  >
                    <Feather name="heart" size={20} color="#FFFFFF" />
                    <Text style={styles.actionBtnLabel}>Favorit</Text>
                  </Pressable>
                )}

                {/* Cart (Keranjang) — ALWAYS VISIBLE WITH FLOATING BADGE! */}
                <Pressable
                  style={styles.headerActionBtn}
                  onPress={() => onNavigate('cart')}
                  hitSlop={8}
                >
                  <View style={styles.cartIconWrapper}>
                    <Feather name="shopping-bag" size={22} color="#FFFFFF" />
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
                          {(userProfile?.name || 'S')[0].toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.userNameHeader} numberOfLines={1}>
                        {userProfile?.name?.split(' ')?.[0] || 'SalSalmann'}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>

            {/* Desktop Navigation Category Strip */}
            {isDesktop && (
              <View style={styles.desktopNavStrip}>
                <Pressable style={[styles.navTabItem, styles.navTabItemActive]} onPress={() => onNavigate('home')}>
                  <MaterialCommunityIcons name="home-variant" size={15} color="#DDEB9D" />
                  <Text style={[styles.navTabText, styles.navTabTextActive]}>Beranda</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('explore')}>
                  <MaterialCommunityIcons name="hanger" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Katalog Busana</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('quiz')}>
                  <MaterialCommunityIcons name="creation" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>AI Stylist Pintar</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('explore')}>
                  <MaterialCommunityIcons name="account-group" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Mitra Penjahit</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('exchange')}>
                  <MaterialCommunityIcons name="recycle" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Eco Swap</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('impact')}>
                  <MaterialCommunityIcons name="leaf" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Dampak Lingkungan</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('orders')}>
                  <MaterialCommunityIcons name="package-variant-closed" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Pesanan Saya</Text>
                </Pressable>
              </View>
            )}

            {/* Sub-header Location Bar */}
            <Pressable
              style={styles.locationBar}
              onPress={() => requireAuth(() => onNavigate('profile-addresses'), 'Masuk untuk mengelola alamat pengiriman.')}
            >
              <Feather name="map-pin" size={11} color="#DDEB9D" />
              <Text style={styles.locationText} numberOfLines={1}>
                Dikirim ke: <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{activeAddressLabel}</Text>
              </Text>
              <Feather name="chevron-down" size={11} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </View>

        {/* ─── Desktop Side-by-Side Hero (66.5% Carousel + 33.5% Stacked Promo) ─ */}
        <View style={styles.heroOuterContainer}>
          {isDesktop ? (
            <View style={styles.desktopHeroRow}>
              {/* Left Carousel (66.5% width) */}
              <View style={[styles.heroCarouselDesktop, { width: heroWidth, height: heroHeight }]}>
                <Animated.ScrollView
                  ref={heroScrollRef}
                  horizontal
                  pagingEnabled
                  bounces={false}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScrollBeginDrag={() => { heroIsDragging.current = true; }}
                  onScrollEndDrag={() => { heroIsDragging.current = false; }}
                  onMomentumScrollEnd={handleHeroScrollEnd}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: heroScrollX } } }],
                    { useNativeDriver: true },
                  )}
                >
                  {heroSlides.map((slide) => (
                    <View key={slide.id} style={{ width: heroWidth, height: heroHeight }}>
                      <AnimatedPressable
                        style={{ width: heroWidth, height: heroHeight, borderRadius: 4, overflow: 'hidden' }}
                        onPress={() => onNavigate(slide.route)}
                        scaleDown={0.99}
                      >
                        <ImageBackground
                          source={{ uri: slide.image }}
                          style={{ width: '100%', height: '100%', justifyContent: 'center' }}
                          imageStyle={{ borderRadius: 4 }}
                          resizeMode="cover"
                        >
                          <View style={styles.heroGradientOverlay} />
                          <View style={styles.heroContentDesktop}>
                            <View style={styles.heroBadgeBrand}>
                              <MaterialCommunityIcons name={slide.badgeIcon} size={11} color="#FFFFFF" />
                              <Text style={styles.heroBadgeBrandText}>{slide.badge}</Text>
                            </View>
                            <Text style={styles.heroTitleDesktop}>{slide.title}</Text>
                            <Text style={styles.heroCopyDesktop}>{slide.copy}</Text>
                            <View style={styles.heroButtonBrand}>
                              <Text style={styles.heroButtonBrandText}>{slide.button}</Text>
                              <Feather name="arrow-right" size={13} color="#FFFFFF" />
                            </View>
                          </View>
                        </ImageBackground>
                      </AnimatedPressable>
                    </View>
                  ))}
                </Animated.ScrollView>

                {/* Carousel Dots */}
                <View style={styles.heroDots}>
                  {heroSlides.map((slide, dotIndex) => (
                    <View
                      key={slide.id}
                      style={[styles.heroDot, heroIndex === dotIndex && styles.heroDotActive]}
                    />
                  ))}
                </View>
              </View>

              {/* Right Stacked 2 Promo Banners (33.5% width) */}
              <View style={[styles.desktopRightStack, { width: heroRightWidth, height: heroHeight }]}>
                <AnimatedPressable
                  style={[styles.desktopRightBanner, { height: (heroHeight - 8) / 2 }]}
                  onPress={() => onNavigate('exchange')}
                  scaleDown={0.98}
                >
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.desktopRightImg}
                    imageStyle={{ borderRadius: 4 }}
                    resizeMode="cover"
                  >
                    <View style={styles.desktopRightOverlay} />
                    <View style={styles.desktopRightContent}>
                      <View style={styles.brandBadgeSmall}>
                        <Text style={styles.brandBadgeSmallText}>♻️ EKSTRA 100 POIN</Text>
                      </View>
                      <Text style={styles.desktopRightTitle}>Tukar Baju Jadi Voucher</Text>
                      <Text style={styles.desktopRightSub}>Daur ulang pakaian tanpa ribet</Text>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>

                <AnimatedPressable
                  style={[styles.desktopRightBanner, { height: (heroHeight - 8) / 2 }]}
                  onPress={() => onNavigate('custom-design')}
                  scaleDown={0.98}
                >
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.desktopRightImg}
                    imageStyle={{ borderRadius: 4 }}
                    resizeMode="cover"
                  >
                    <View style={styles.desktopRightOverlay} />
                    <View style={styles.desktopRightContent}>
                      <View style={[styles.brandBadgeSmall, { backgroundColor: colors.forestMid }]}>
                        <Text style={styles.brandBadgeSmallText}>✂️ BESPOKE ATELIER</Text>
                      </View>
                      <Text style={styles.desktopRightTitle}>Jahit Kustom Presisi</Text>
                      <Text style={styles.desktopRightSub}>100% dibuat sesuai ukuranmu</Text>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>
              </View>
            </View>
          ) : (
            <View style={styles.mobileHeroWrapper}>
              <View style={[styles.heroCarousel, { width: heroWidth, height: heroHeight }]}>
                <Animated.ScrollView
                  ref={heroScrollRef}
                  horizontal
                  pagingEnabled
                  bounces={false}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScrollBeginDrag={() => { heroIsDragging.current = true; }}
                  onScrollEndDrag={() => { heroIsDragging.current = false; }}
                  onMomentumScrollEnd={handleHeroScrollEnd}
                >
                  {heroSlides.map((slide) => (
                    <View key={slide.id} style={{ width: heroWidth, height: heroHeight }}>
                      <AnimatedPressable
                        style={{ width: heroWidth, height: heroHeight, borderRadius: 6, overflow: 'hidden' }}
                        onPress={() => onNavigate(slide.route)}
                        scaleDown={0.99}
                      >
                        <ImageBackground
                          source={{ uri: slide.image }}
                          style={{ width: '100%', height: '100%', justifyContent: 'center' }}
                          imageStyle={{ borderRadius: 6 }}
                          resizeMode="cover"
                        >
                          <View style={styles.heroGradientOverlay} />
                          <View style={styles.heroContent}>
                            <View style={styles.heroBadgeBrand}>
                              <MaterialCommunityIcons name={slide.badgeIcon} size={11} color="#FFFFFF" />
                              <Text style={styles.heroBadgeBrandText}>{slide.badge}</Text>
                            </View>
                            <Text style={styles.heroTitle}>{slide.title}</Text>
                            <Text style={styles.heroCopy}>{slide.copy}</Text>
                          </View>
                        </ImageBackground>
                      </AnimatedPressable>
                    </View>
                  ))}
                </Animated.ScrollView>
                <View style={styles.heroDots}>
                  {heroSlides.map((slide, dotIndex) => (
                    <View
                      key={slide.id}
                      style={[styles.heroDot, heroIndex === dotIndex && styles.heroDotActive]}
                    />
                  ))}
                </View>
              </View>

              {/* Mobile Duo Promo */}
              <View style={styles.mobileDuoPromoContainer}>
                <AnimatedPressable
                  style={styles.mobileDuoCard}
                  onPress={() => onNavigate('exchange')}
                  scaleDown={0.98}
                >
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.mobileDuoImg}
                    imageStyle={{ borderRadius: 4 }}
                    resizeMode="cover"
                  >
                    <View style={styles.desktopRightOverlay} />
                    <View style={styles.mobileDuoContent}>
                      <Text style={styles.mobileDuoTitle}>Tukar Baju</Text>
                      <Text style={styles.mobileDuoSub}>+100 Poin</Text>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>

                <AnimatedPressable
                  style={styles.mobileDuoCard}
                  onPress={() => onNavigate('custom-design')}
                  scaleDown={0.98}
                >
                  <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85' }}
                    style={styles.mobileDuoImg}
                    imageStyle={{ borderRadius: 4 }}
                    resizeMode="cover"
                  >
                    <View style={styles.desktopRightOverlay} />
                    <View style={styles.mobileDuoContent}>
                      <Text style={styles.mobileDuoTitle}>Jahit Kustom</Text>
                      <Text style={styles.mobileDuoSub}>Bespoke Fit</Text>
                    </View>
                  </ImageBackground>
                </AnimatedPressable>
              </View>
            </View>
          )}
        </View>

        {/* ─── 10-Icon Service Launcher (Shopee Single Row Style) ─────── */}
        <View style={styles.serviceGridContainer}>
          <View style={styles.serviceGridCard}>
            <View style={styles.serviceGridRow}>
              {serviceIcons.map((service) => (
                <Pressable
                  key={service.id}
                  style={[styles.serviceItem, isDesktop && screenWidth >= 1200 && { width: '9.6%', marginVertical: 2 }]}
                  onPress={() => {
                    if (service.route === 'passport-info') {
                      setScanModalVisible(true);
                    } else {
                      onNavigate(service.route);
                    }
                  }}
                >
                  <View style={[styles.serviceIconCircle, { backgroundColor: service.bg }]}>
                    <MaterialCommunityIcons name={service.icon} size={24} color={service.color} />
                  </View>
                  <Text style={styles.serviceLabel} numberOfLines={2}>{service.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ─── Trust Badges Bar ───────────────────────────────────────── */}
        <TrustStrip />

        {/* ─── Kategori Pilihan (Visual Categories Grid) ───────────────── */}
        <View style={styles.shopeeCategorySection}>
          <View style={styles.shopeeCategoryInner}>
            <View style={styles.shopeeCategoryHeader}>
              <Text style={styles.shopeeCategoryHeaderText}>KATEGORI</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.shopeeCategoryScroll, isDesktop && { justifyContent: 'space-between', flexGrow: 1 }]}
            >
              {shopeeCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.shopeeCategoryItem}
                  onPress={() => onNavigate(cat.route)}
                >
                  <View style={styles.shopeeCategoryThumbWrap}>
                    <Image source={{ uri: cat.image }} style={styles.shopeeCategoryThumb} />
                  </View>
                  <Text style={styles.shopeeCategoryLabel} numberOfLines={2}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ─── Flash Sale Section (Atelier Kilat) ───────────────────────── */}
        <View style={styles.curationSection}>
          <View style={styles.curationInner}>
            <View style={styles.curationHeader}>
              <View style={styles.curationTitleRow}>
                <MaterialCommunityIcons name="fire" size={24} color="#EA580C" />
                <Text style={styles.flashSaleTitle}>FLASH SALE ATELIER</Text>
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
              {products.slice(0, isDesktop ? 10 : 6).map((p) => {
                const stock = p.stock ?? 1;
                const originalPrice = Math.round(p.price * 1.35);
                return (
                  <AnimatedPressable
                    key={p.id}
                    style={[styles.flashProductCard, isDesktop && { width: screenWidth >= 1440 ? 175 : 155 }]}
                    onPress={() => onProductPress(p)}
                    scaleDown={0.97}
                  >
                    <ImageBackground
                      source={{ uri: p.image }}
                      style={[styles.flashProductImg, isDesktop && { height: screenWidth >= 1440 ? 155 : 135 }]}
                      imageStyle={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    >
                      <View style={styles.flashDiscountBadge}>
                        <Text style={styles.flashDiscountText}>-35%</Text>
                      </View>
                    </ImageBackground>

                    <View style={styles.flashProductBody}>
                      <View style={styles.flashPriceRow}>
                        <Text style={styles.flashCurrency}>Rp</Text>
                        <Text style={styles.flashPrice}>{p.price.toLocaleString('id-ID')}</Text>
                      </View>
                      <Text style={styles.flashOriginalPrice}>Rp{originalPrice.toLocaleString('id-ID')}</Text>

                      {/* Progress Bar */}
                      <View style={styles.shopeeProgressBar}>
                        <View style={[styles.shopeeProgressFill, { width: `${Math.min(100, (15 - stock) * 7 + 35)}%` }]} />
                        <Text style={styles.shopeeProgressText}>
                          🔥 SEGERA HABIS
                        </Text>
                      </View>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* ─── FashionKu Mall Section ─────────────────────────────────── */}
        <View style={styles.shopeeMallSection}>
          <View style={styles.shopeeMallInner}>
            <View style={styles.shopeeMallHeader}>
              <View style={styles.shopeeMallHeaderLeft}>
                <View style={styles.shopeeMallBadge}>
                  <Text style={styles.shopeeMallBadgeText}>MALL</Text>
                </View>
                <Text style={styles.shopeeMallTitle}>FASHIONKU MALL</Text>
                {isDesktop && (
                  <View style={styles.shopeeMallPillRow}>
                    <Text style={styles.shopeeMallPill}>🛡️ 100% Terverifikasi DPP</Text>
                    <Text style={styles.shopeeMallPill}>🔄 7 Hari Garansi Pas</Text>
                    <Text style={styles.shopeeMallPill}>🚚 Bebas Ongkir XTRA</Text>
                  </View>
                )}
              </View>
              <Pressable onPress={() => onNavigate('explore')}>
                <Text style={styles.shopeeMallSeeAll}>Lihat Semua &gt;</Text>
              </Pressable>
            </View>

            {/* Atelier Brand Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shopeeMallScroll}
            >
              {tailors.map((t) => (
                <AnimatedPressable
                  key={t.id}
                  style={styles.shopeeMallCard}
                  onPress={() => onTailorPress?.(t)}
                  scaleDown={0.97}
                >
                  <ImageBackground
                    source={{ uri: t.image }}
                    style={styles.shopeeMallCardImg}
                    imageStyle={{ borderRadius: 4 }}
                  >
                    <View style={styles.shopeeMallCardOverlay} />
                    <View style={styles.shopeeMallCardTag}>
                      <Text style={styles.shopeeMallCardTagText}>OFFICIAL</Text>
                    </View>
                    <Text style={styles.shopeeMallCardName} numberOfLines={1}>{t.name}</Text>
                    <Text style={styles.shopeeMallCardCity} numberOfLines={1}>{t.city}</Text>
                  </ImageBackground>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ─── Welcome Perk Voucher Card ──────────────────────────────── */}
        <View style={styles.welcomePerkContainer}>
          <View style={styles.welcomePerkCard}>
            <View style={styles.welcomePerkLeft}>
              <View style={styles.welcomePerkIcon}>
                <LeafMark size={16} color={colors.forest} />
              </View>
              <View style={styles.welcomePerkText}>
                <Text style={styles.welcomePerkTitle}>Voucher Sambutan Pengguna Baru</Text>
                <Text style={styles.welcomePerkSub}>Diskon Rp25.000 untuk pesanan pertamamu</Text>
                <View style={styles.welcomeCodeRow}>
                  <Text style={styles.welcomeCodeTag}>Kode: FASHIONKU25</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={[styles.copyBtn, copiedCode && styles.copyBtnDone]}
              onPress={copyPromoCode}
            >
              <Text style={[styles.copyBtnText, copiedCode && styles.copyBtnTextDone]}>
                {copiedCode ? 'Tersalin ✓' : 'Klaim'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Rekomendasi (Daily Discover Sticky Tabs & Product Grid) ─── */}
        <View style={styles.shopeeDailyDiscoverContainer}>
          <View style={styles.shopeeDailyDiscoverInner}>
            {/* Active Tab Header Bar */}
            <View style={styles.shopeeDiscoverTabsBar}>
              <View style={styles.shopeeActiveTab}>
                <Text style={styles.shopeeActiveTabText}>REKOMENDASI</Text>
                <View style={styles.shopeeActiveUnderline} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shopeeCategoryFilterRow}
              >
                {categories.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.shopeeFilterChip, category === c && styles.shopeeFilterChipActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.shopeeFilterChipText, category === c && styles.shopeeFilterChipTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Responsive Product Grid */}
            <View style={[styles.productGrid, { gap: gridGap }]}>
              {featuredProducts.slice(0, numCols * 4).map((product) => (
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

            {/* Load More Button */}
            <View style={styles.loadMoreWrap}>
              <Pressable style={styles.loadMoreBtn} onPress={() => onNavigate('explore')}>
                <Text style={styles.loadMoreText}>Lihat Lebih Banyak</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── UMKM Impact Banner ──────────────────────────────────────── */}
        <View style={styles.umkmBannerOuter}>
          <AnimatedPressable
            style={styles.umkmBanner}
            onPress={() => onNavigate('impact')}
            scaleDown={0.98}
          >
            <View style={styles.umkmBannerLeft}>
              <View style={styles.umkmBannerIcon}>
                <MaterialCommunityIcons name="account-group" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.umkmBannerText}>
                <Text style={styles.umkmBannerTitle}>134 Penjahit UMKM Terdaftar</Text>
                <Text style={styles.umkmBannerSub}>
                  Setiap pesanan memberdayakan artisan lokal Indonesia dengan standar sirkular
                </Text>
              </View>
            </View>
            <View style={styles.umkmBannerArrow}>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </AnimatedPressable>
        </View>

        {/* ─── 5-Column Desktop Footer (Brand Palette) ─────────────────── */}
        {isDesktop && (
          <View style={styles.desktopFooter}>
            <View style={styles.desktopFooterInner}>
              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>LAYANAN PELANGGAN</Text>
                <Text style={styles.footerLink}>Pusat Bantuan</Text>
                <Text style={styles.footerLink}>Cara Pembelian</Text>
                <Text style={styles.footerLink}>Pengiriman & Bebas Ongkir</Text>
                <Text style={styles.footerLink}>Garansi Ukuran Pas 100%</Text>
                <Text style={styles.footerLink}>Pengembalian Barang & Dana</Text>
                <Text style={styles.footerLink}>Hubungi Kami</Text>
              </View>

              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>JELAJAHI FASHIONKU</Text>
                <Text style={styles.footerLink}>Tentang Kami</Text>
                <Text style={styles.footerLink}>Mitra Penjahit UMKM</Text>
                <Text style={styles.footerLink}>Paspor Digital DPP</Text>
                <Text style={styles.footerLink}>Dampak Lingkungan</Text>
                <Text style={styles.footerLink}>Karir & Kebijakan Privasi</Text>
                <Text style={styles.footerLink}>FashionKu Blog</Text>
              </View>

              <View style={styles.footerCol}>
                <Text style={styles.footerColTitle}>PEMBAYARAN</Text>
                <View style={styles.footerBadgeWrap}>
                  {['QRIS', 'BCA', 'Mandiri', 'BNI', 'BRI', 'GoPay', 'COD'].map((pay) => (
                    <View key={pay} style={styles.footerPayBadge}>
                      <Text style={styles.footerPayText}>{pay}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.footerColTitle, { marginTop: 14 }]}>PENGIRIMAN</Text>
                <View style={styles.footerBadgeWrap}>
                  {['J&T', 'SiCepat', 'JNE', 'GoSend', 'AnterAja'].map((courier) => (
                    <View key={courier} style={styles.footerPayBadge}>
                      <Text style={styles.footerPayText}>{courier}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.footerColWide}>
                <View style={styles.footerBrandRow}>
                  <View style={styles.footerBrandLogoCard}>
                    <Image source={LOGO} style={styles.footerBrandLogo} resizeMode="contain" />
                  </View>
                  <Text style={styles.footerBrandName}>FashionKu</Text>
                </View>
                <Text style={styles.footerBrandDesc}>
                  Platform e-commerce fesyen sirkular terdepan Indonesia. Menghubungkan pembeli dengan 134 artisan penjahit lokal untuk menghasilkan busana bespoke ramah lingkungan dengan transparansi Digital Product Passport (DPP).
                </Text>
                <View style={styles.footerCertBadge}>
                  <MaterialCommunityIcons name="shield-check" size={16} color={colors.forest} />
                  <Text style={styles.footerCertText}>100% Terverifikasi Ramah Lingkungan & DPP Certified</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerBottomBar}>
              <Text style={styles.footerCopyright}>
                © 2026 FashionKu Indonesia. Hak Cipta Dilindungi. Platform Fesyen Sirkular & Bespoke.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── Floating Chat Widget on Desktop (#2C6842) ────────────────── */}
      {isDesktop && (
        <View style={styles.floatingChatWrap}>
          <Pressable
            style={styles.floatingChatBtn}
            onPress={() => onNavigate('quiz')}
          >
            <MaterialCommunityIcons name="chat-processing" size={20} color="#FFFFFF" />
            <Text style={styles.floatingChatText}>Chat</Text>
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>1</Text>
            </View>
          </Pressable>
        </View>
      )}

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
  const { width } = useWindowDimensions();
  const isDesk = width >= 768;
  return (
    <View style={styles.trustStripContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.trustStripContent, isDesk && { justifyContent: 'space-between', flexGrow: 1 }]}
      >
        {trustBadges.map((item, idx) => (
          <View key={idx} style={[styles.trustBadgePill, isDesk && { flex: 1, justifyContent: 'center' }]}>
            <MaterialCommunityIcons name={item.icon} size={13} color={colors.forest} />
            <Text style={styles.trustBadgeText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 110,
  },

  // ─── Header: Solid Forest Green (99.5% Authentic Shopee Layout) ─────────────
  topHeader: {
    backgroundColor: colors.forest,
    borderBottomWidth: 1,
    borderBottomColor: colors.forestMid,
    width: '100%',
    paddingBottom: 6,
    ...shadows.md,
  },
  topUtilityBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 6,
    width: '100%',
  },
  topUtilityInner: {
    maxWidth: 1680,
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
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '500',
  },
  utilityDivider: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
  },
  utilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  utilityPillText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topHeaderInner: {
    maxWidth: 1680,
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
    gap: 8,
  },
  brandLogoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 3,
  },
  brandLogo: {
    width: 32,
    height: 32,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTaglineText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DDEB9D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  searchSection: {
    flex: 1,
    maxWidth: 760,
  },
  searchBox: {
    width: '100%',
  },
  searchInner: {
    height: 42,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 3,
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  searchIconLeft: {
    marginRight: 6,
  },
  searchText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  searchSubmitBtn: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 2,
    backgroundColor: colors.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quickKeywordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingLeft: 2,
  },
  quickKeyword: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.90)',
    fontWeight: '500',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  headerLoginBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 3,
  },
  headerLoginText: {
    color: colors.forest,
    fontSize: 12.5,
    fontWeight: '800',
  },
  headerUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  userAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  userNameHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  desktopNavStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 6,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  navTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navTabItemActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#DDEB9D',
  },
  navTabText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  navTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 3,
    paddingBottom: 2,
  },
  locationText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // ─── Hero Section ──────────────────────────────────────────────────────────
  heroOuterContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  desktopHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCarouselDesktop: {
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  heroCarousel: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroContentDesktop: {
    paddingHorizontal: 26,
    paddingVertical: 20,
    zIndex: 2,
  },
  heroContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 2,
  },
  heroBadgeBrand: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginBottom: 6,
  },
  heroBadgeBrandText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitleDesktop: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  heroCopyDesktop: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 480,
    marginTop: 4,
  },
  heroCopy: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  heroButtonBrand: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 3,
    marginTop: 12,
  },
  heroButtonBrandText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroDots: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    zIndex: 5,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroDotActive: {
    backgroundColor: colors.forest,
    width: 16,
  },

  // ─── Desktop Right Stacked Promo Banners ───────────────────────────────────
  desktopRightStack: {
    justifyContent: 'space-between',
  },
  desktopRightBanner: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    ...shadows.sm,
  },
  desktopRightImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  desktopRightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
  },
  desktopRightContent: {
    padding: 10,
    zIndex: 2,
  },
  brandBadgeSmall: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginBottom: 3,
  },
  brandBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  desktopRightTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  desktopRightSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
  },

  // ─── Mobile Hero & Duo Promo ───────────────────────────────────────────────
  mobileHeroWrapper: {
    gap: 8,
  },
  mobileDuoPromoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  mobileDuoCard: {
    flex: 1,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mobileDuoImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  mobileDuoContent: {
    padding: 8,
    zIndex: 2,
  },
  mobileDuoTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mobileDuoSub: {
    color: '#DDEB9D',
    fontSize: 10,
    fontWeight: '700',
  },

  // ─── Trust Badges ──────────────────────────────────────────────────────────
  trustStripContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  trustStripContent: {
    flexDirection: 'row',
    gap: 8,
  },
  trustBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
  },

  // ─── 10-Icon Service Launcher Grid ─────────────────────────────────────────
  serviceGridContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
  },
  serviceGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...shadows.sm,
  },
  serviceGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  serviceItem: {
    alignItems: 'center',
    width: '18%',
    minWidth: 64,
    marginVertical: 4,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ─── Flash Sale Section ────────────────────────────────────────────────────
  curationSection: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  curationInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    ...shadows.sm,
  },
  curationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  curationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashSaleTitle: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.forest,
    letterSpacing: 0.3,
  },
  flashCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timerBlock: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  timerBlockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  timerColon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E293B',
  },
  curationSeeAll: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  curationScroll: {
    gap: 10,
  },
  flashProductCard: {
    width: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
    overflow: 'hidden',
  },
  flashProductImg: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  flashDiscountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  flashDiscountText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '900',
  },
  flashProductBody: {
    padding: 6,
    alignItems: 'center',
  },
  flashPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  flashCurrency: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '700',
  },
  flashPrice: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  flashOriginalPrice: {
    fontSize: 9.5,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  shopeeProgressBar: {
    width: '100%',
    height: 14,
    backgroundColor: '#EDF7EE',
    borderRadius: 7,
    marginTop: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopeeProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.forest,
    borderRadius: 7,
  },
  shopeeProgressText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    zIndex: 2,
  },

  // ─── FashionKu Mall Section ───────────────────────────────────────────────
  shopeeMallSection: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  shopeeMallInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    ...shadows.sm,
  },
  shopeeMallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
    marginBottom: 10,
  },
  shopeeMallHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopeeMallBadge: {
    backgroundColor: colors.forest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  shopeeMallBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  shopeeMallTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.forest,
    letterSpacing: 0.3,
  },
  shopeeMallPillRow: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 8,
  },
  shopeeMallPill: {
    fontSize: 11,
    color: '#333333',
    fontWeight: '500',
  },
  shopeeMallSeeAll: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  shopeeMallScroll: {
    gap: 10,
  },
  shopeeMallCard: {
    width: 150,
    height: 100,
    borderRadius: 4,
    overflow: 'hidden',
    ...shadows.sm,
  },
  shopeeMallCardImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 8,
  },
  shopeeMallCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  shopeeMallCardTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  shopeeMallCardTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  shopeeMallCardName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    zIndex: 2,
  },
  shopeeMallCardCity: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9.5,
    zIndex: 2,
  },

  // ─── Kategori Pilihan ──────────────────────────────────────────────────────
  shopeeCategorySection: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  shopeeCategoryInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    ...shadows.sm,
  },
  shopeeCategoryHeader: {
    marginBottom: 10,
  },
  shopeeCategoryHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#757575',
    letterSpacing: 0.2,
  },
  shopeeCategoryScroll: {
    gap: 12,
  },
  shopeeCategoryItem: {
    alignItems: 'center',
    width: 90,
  },
  shopeeCategoryThumbWrap: {
    width: 68,
    height: 68,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    marginBottom: 6,
  },
  shopeeCategoryThumb: {
    width: '100%',
    height: '100%',
  },
  shopeeCategoryLabel: {
    fontSize: 10.5,
    color: '#222222',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },

  // ─── Welcome Perk Card ─────────────────────────────────────────────────────
  welcomePerkContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  welcomePerkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  welcomePerkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  welcomePerkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomePerkText: {
    flex: 1,
  },
  welcomePerkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#222222',
  },
  welcomePerkSub: {
    fontSize: 11,
    color: '#757575',
  },
  welcomeCodeRow: {
    marginTop: 3,
  },
  welcomeCodeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forest,
  },
  copyBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 3,
  },
  copyBtnDone: {
    backgroundColor: '#10B981',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  copyBtnTextDone: {
    color: '#FFFFFF',
  },

  // ─── Rekomendasi (Daily Discover Sticky Tabs & Product Grid) ───────────────
  shopeeDailyDiscoverContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  shopeeDailyDiscoverInner: {
    gap: 10,
  },
  shopeeDiscoverTabsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  shopeeActiveTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.forest,
    paddingVertical: 10,
    paddingHorizontal: 14,
    position: 'relative',
  },
  shopeeActiveTabText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.forest,
    letterSpacing: 0.3,
  },
  shopeeCategoryFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
  },
  shopeeFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
  },
  shopeeFilterChipActive: {
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: colors.forest,
  },
  shopeeFilterChipText: {
    fontSize: 11.5,
    color: '#757575',
    fontWeight: '500',
  },
  shopeeFilterChipTextActive: {
    color: colors.forest,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  loadMoreWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  loadMoreBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  loadMoreText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
  },

  // ─── UMKM Banner ───────────────────────────────────────────────────────────
  umkmBannerOuter: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  umkmBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  umkmBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  umkmBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  umkmBannerText: {
    flex: 1,
  },
  umkmBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  umkmBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  umkmBannerArrow: {
    marginLeft: 8,
  },

  // ─── Desktop Footer (Brand Palette) ────────────────────────────────────────
  desktopFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 4,
    borderTopColor: colors.forest,
    marginTop: 24,
    paddingTop: 32,
    paddingBottom: 20,
    width: '100%',
  },
  desktopFooterInner: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 20,
  },
  footerCol: {
    flex: 1,
    gap: 8,
  },
  footerColWide: {
    flex: 1.5,
    gap: 10,
  },
  footerColTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.87)',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 11.5,
    color: 'rgba(0,0,0,0.65)',
    fontWeight: '400',
  },
  footerBadgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerPayBadge: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#ECECEC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  footerPayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555555',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerBrandLogoCard: {
    backgroundColor: '#EDF7EE',
    borderRadius: 4,
    padding: 3,
  },
  footerBrandLogo: {
    width: 26,
    height: 26,
  },
  footerBrandName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.forest,
  },
  footerBrandDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.65)',
    lineHeight: 16,
  },
  footerCertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF7EE',
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#C6E7CE',
  },
  footerCertText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.forest,
  },
  footerBottomBar: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
    marginTop: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.54)',
  },

  // ─── Floating Chat Widget (#2C6842) ────────────────────────────────────────
  floatingChatWrap: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 99,
  },
  floatingChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    ...shadows.lg,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  floatingChatText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  chatBadge: {
    backgroundColor: '#DDEB9D',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadgeText: {
    color: colors.forestMid,
    fontSize: 9,
    fontWeight: '900',
  },
});
