/**
 * @file ExploreScreen.js
 * @description Product catalogue screen with Shopee-grade solid brand green header,
 * search, quick keywords, sort, and category filter.
 *
 * Header matches HomeScreen 100% with solid forest green theme (#2C6842),
 * full-width search bar with "Cari" button, trending keywords row,
 * and seamless navigation.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import ProductCard from '../components/ProductCard';
import PassportScannerModal from '../components/PassportScannerModal';
import PassportModal from '../components/PassportModal';
import { useDebounce } from '../hooks/useDebounce';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

const LOGO = require('../../assets/images/fashionku_icon_transparent.png');

const trendingKeywords = [
  'Kain Sisa',
  'Outer Linen',
  'Batik Upcycled',
  'Zero Waste',
  'Penjahit Lokal',
  'Dress MTO',
];

export default function ExploreScreen({ onProductPress, onNavigate, onBack, wishlistOnly = false }) {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;
  const maxContentWidth = isDesktop ? Math.min(screenWidth - 32, 1680) : screenWidth;
  const numCols = screenWidth >= 1500 ? 6 : screenWidth >= 1200 ? 5 : screenWidth >= 768 ? 4 : 2;
  const gridGap = screenWidth < 500 ? 8 : 12;
  const availableGridWidth = maxContentWidth - (isDesktop ? 32 : 16);
  const cardWidth = Math.floor((availableGridWidth - (numCols - 1) * gridGap) / numCols);
  const cardSlotStyle = { width: cardWidth };

  const [category, setCategory] = useState('Semua');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Terbaru');
  const [filterOpen, setFilterOpen] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scannedPassportOrder, setScannedPassportOrder] = useState(null);

  const {
    categories,
    products,
    sortOptions,
    wishlist,
    cart,
    toggleWishlist,
    requireAuth,
    circularPoints,
    isLoggedIn,
    userProfile,
    openAuthModal,
    orders = [],
  } = useAppState();

  const searchInputRef = useRef(null);

  // Debounce the raw search query (250ms)
  const debouncedQuery = useDebounce(query, 250);

  // Filter panel slide animation
  const filterHeight = useRef(new Animated.Value(0)).current;
  const filterOpacity = useRef(new Animated.Value(0)).current;

  const toggleFilter = () => {
    const opening = !filterOpen;
    setFilterOpen(opening);
    Animated.parallel([
      Animated.spring(filterHeight, {
        toValue: opening ? 120 : 0,
        useNativeDriver: false,
        speed: 16,
        bounciness: 2,
      }),
      Animated.timing(filterOpacity, {
        toValue: opening ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        const catMatch = category === 'Semua' || p.category === category;
        const searchMatch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.tailor.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q));
        const wishlistMatch = !wishlistOnly || wishlist.includes(p.id);
        return catMatch && searchMatch && wishlistMatch;
      })
      .sort((a, b) => {
        if (sort === 'Harga Terendah') return a.price - b.price;
        if (sort === 'Harga Tertinggi') return b.price - a.price;
        if (sort === 'Rating') return b.rating - a.rating;
        return a.id - b.id;
      });
  }, [category, products, debouncedQuery, sort, wishlist, wishlistOnly]);

  const handleKeywordClick = (kw) => {
    setQuery(kw);
    setCategory('Semua');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── EXACT SHOPEE-GRADE FOREST GREEN HEADER (MATCHING HOMESCREEN) ─ */}
        <View style={styles.topHeader}>
          {/* Top Utility Bar (Desktop only) */}
          {isDesktop && (
            <View style={styles.topUtilityBar}>
              <View style={styles.topUtilityInner}>
                <View style={styles.utilityLeft}>
                  <Text style={styles.utilityLink}>Tentang FashionKu</Text>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Pressable onPress={() => onNavigate('tailor-portal')}>
                    <Text style={styles.utilityLink}>Mitra Penjahit UMKM</Text>
                  </Pressable>
                  <Text style={styles.utilityDivider}>|</Text>
                  <Pressable onPress={() => onNavigate('admin-cms')}>
                    <Text style={styles.utilityLink}>Admin CMS</Text>
                  </Pressable>
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
                  <Pressable onPress={() => onNavigate('orders')}>
                    <Text style={styles.utilityLink}>Bantuan</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Main Header Container */}
          <View style={styles.topHeaderInner}>
            <View style={styles.mainHeaderRow}>
              {/* Back button on mobile or when wishlistOnly */}
              {(!isDesktop || wishlistOnly) && (
                <Pressable
                  style={styles.mobileBackBtn}
                  onPress={onBack ? onBack : () => onNavigate('home')}
                  hitSlop={8}
                >
                  <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </Pressable>
              )}

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

              {/* ─── Big Search Box with Forest Green "Cari" Button (EXACT MATCH) ─── */}
              <View style={styles.searchSection}>
                <View style={styles.searchBox}>
                  <View style={styles.searchInner}>
                    <Feather name="search" size={16} color="#64748B" style={styles.searchIconLeft} />
                    <TextInput
                      ref={searchInputRef}
                      value={query}
                      onChangeText={setQuery}
                      placeholder={
                        isDesktop
                          ? 'Cari outfit upcycled, dress kain sisa, penjahit Jogja...'
                          : 'Cari di FashionKu...'
                      }
                      placeholderTextColor="#64748B"
                      style={styles.searchInput}
                      returnKeyType="search"
                    />

                    {/* Clear Button */}
                    {!!query && (
                      <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clearBtnWrap}>
                        <Feather name="x" size={14} color="#94A3B8" />
                      </Pressable>
                    )}

                    {/* Forest Green Search Submit Button */}
                    <Pressable
                      style={styles.searchSubmitBtn}
                      onPress={() => searchInputRef.current?.blur()}
                    >
                      <Feather
                        name="search"
                        size={14}
                        color="#FFFFFF"
                        style={{ marginRight: isDesktop ? 4 : 0 }}
                      />
                      {isDesktop && <Text style={styles.searchSubmitText}>Cari</Text>}
                    </Pressable>
                  </View>
                </View>

                {/* Quick Trending Keywords under Search Box (Photo 1 exact match) */}
                {isDesktop && (
                  <View style={styles.quickKeywordsRow}>
                    {trendingKeywords.map((kw) => (
                      <Pressable key={kw} onPress={() => handleKeywordClick(kw)}>
                        <Text
                          style={[
                            styles.quickKeyword,
                            query.toLowerCase() === kw.toLowerCase() && styles.quickKeywordActive,
                          ]}
                        >
                          {kw}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Header Right Actions */}
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

                {/* Wishlist */}
                {isDesktop && (
                  <Pressable
                    style={styles.headerActionBtn}
                    onPress={() => onNavigate('explore', { wishlistOnly: !wishlistOnly })}
                    hitSlop={8}
                  >
                    <Feather
                      name="heart"
                      size={20}
                      color={wishlistOnly ? '#F59E0B' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.actionBtnLabel,
                        wishlistOnly && { color: '#F59E0B', fontWeight: '800' },
                      ]}
                    >
                      {wishlistOnly ? 'Semua' : 'Favorit'}
                    </Text>
                  </Pressable>
                )}

                {/* Cart with floating badge */}
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

                {/* Desktop User profile/login button */}
                {isDesktop && (
                  !isLoggedIn ? (
                    <Pressable
                      style={styles.headerLoginBtn}
                      onPress={() => openAuthModal('Masuk ke akun FashionKu untuk belanja.')}
                    >
                      <Text style={styles.headerLoginText}>Masuk</Text>
                    </Pressable>
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
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('home')}>
                  <MaterialCommunityIcons name="home-variant" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>Beranda</Text>
                </Pressable>
                <Pressable style={[styles.navTabItem, styles.navTabItemActive]} onPress={() => onNavigate('explore')}>
                  <MaterialCommunityIcons name="hanger" size={15} color="#DDEB9D" />
                  <Text style={[styles.navTabText, styles.navTabTextActive]}>Katalog Busana</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('quiz')}>
                  <MaterialCommunityIcons name="creation" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.navTabText}>AI Stylist Pintar</Text>
                </Pressable>
                <Pressable style={styles.navTabItem} onPress={() => onNavigate('tailor-portal')}>
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
          </View>
        </View>

        {/* ─── BODY CONTENT AREA ────────────────────────────────────────── */}
        <View style={styles.contentContainer}>
          {/* Mobile trending keywords scroll */}
          {!isDesktop && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mobileKeywordsScroll}
            >
              {trendingKeywords.map((kw) => (
                <Pressable
                  key={kw}
                  style={[styles.mobileKwChip, query === kw && styles.mobileKwChipActive]}
                  onPress={() => handleKeywordClick(kw)}
                >
                  <Text style={[styles.mobileKwText, query === kw && styles.mobileKwTextActive]}>
                    {kw}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Category Chips Bar */}
          <View style={styles.categoryBarWrap}>
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

          {/* Filter, Sort & Result Count Row */}
          <View style={styles.sortResultBar}>
            <View style={styles.resultLeftGroup}>
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>{filteredProducts.length} Produk</Text>
              </View>
              {!!debouncedQuery && (
                <Text style={styles.resultQueryText} numberOfLines={1}>
                  untuk "{debouncedQuery}"
                </Text>
              )}
              {wishlistOnly && (
                <View style={styles.wishlistFilterPill}>
                  <Text style={styles.wishlistFilterPillText}>❤️ Wishlist Tersimpan</Text>
                </View>
              )}
            </View>

            {/* Quick Sort Chips on Desktop */}
            <View style={styles.sortActionsGroup}>
              {isDesktop && (
                <View style={styles.desktopSortChipsRow}>
                  {sortOptions.map((opt) => (
                    <Pressable
                      key={opt}
                      style={[styles.sortChip, sort === opt && styles.sortChipActive]}
                      onPress={() => setSort(opt)}
                    >
                      <Text style={[styles.sortChipText, sort === opt && styles.sortChipTextActive]}>
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Pressable
                style={[styles.filterButton, filterOpen && styles.filterButtonActive]}
                onPress={toggleFilter}
              >
                <Feather
                  name="sliders"
                  size={14}
                  color={filterOpen ? colors.white : colors.forest}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    filterOpen && styles.filterButtonTextActive,
                  ]}
                >
                  Filter
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Animated Filter Drawer (Mobile / Extended) */}
          <Animated.View
            style={[
              styles.filterPanel,
              {
                maxHeight: filterHeight,
                opacity: filterOpacity,
                marginBottom: filterOpen ? 12 : 0,
              },
            ]}
          >
            <Text style={styles.filterTitle}>Urutkan Berdasarkan:</Text>
            <View style={styles.sortRow}>
              {sortOptions.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.sortChip, sort === item && styles.sortChipActive]}
                  onPress={() => setSort(item)}
                >
                  <Text style={[styles.sortChipText, sort === item && styles.sortChipTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* ─── Product Grid / Empty State ─────────────────────────────── */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={40} color={colors.forest} />
              </View>
              <Text style={styles.emptyTitle}>
                {wishlistOnly ? 'Wishlist masih kosong' : 'Produk sirkular tidak ditemukan'}
              </Text>
              <Text style={styles.emptyDesc}>
                {wishlistOnly
                  ? 'Simpan produk favoritmu dengan menekan tombol hati agar muncul di sini.'
                  : `Tidak ada busana yang cocok dengan pencarian "${query}". Coba kata kunci atau kategori lain.`}
              </Text>
              <Pressable
                style={styles.emptyReset}
                onPress={() => {
                  setQuery('');
                  setCategory('Semua');
                }}
              >
                <Text style={styles.emptyResetText}>Reset Pencarian & Filter</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  grid
                  slotStyle={cardSlotStyle}
                  favorite={wishlist.includes(product.id)}
                  onToggleFavorite={() =>
                    requireAuth(
                      () => toggleWishlist(product.id),
                      'Masuk ke akun untuk menyimpan produk ke Wishlist.'
                    )
                  }
                  onPress={() => onProductPress(product)}
                />
              ))}
            </View>
          )}
        </View>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // ─── Solid Forest Green Top Header (Shopee Authentic) ──────────────────────
  topHeader: {
    backgroundColor: '#2C6842',
    borderBottomWidth: 1,
    borderBottomColor: '#235334',
    width: '100%',
    paddingBottom: 4,
    ...shadows.md,
  },
  topUtilityBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 4,
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
    paddingVertical: 2,
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
  mobileBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
  // ─── Search Box & Submit Button (Photo 1 Exact Replica) ─────────────────────
  searchSection: {
    flex: 1,
    maxWidth: 780,
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
    ...shadows.sm,
  },
  searchIconLeft: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtnWrap: {
    paddingHorizontal: 8,
  },
  searchSubmitBtn: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 2,
    backgroundColor: '#2C6842',
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
  quickKeywordActive: {
    color: '#DDEB9D',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    minWidth: 42,
  },
  actionBtnLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '600',
    marginTop: 2,
  },
  cartIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  headerLoginBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 4,
  },
  headerLoginText: {
    color: '#2C6842',
    fontSize: 12,
    fontWeight: '800',
  },
  headerUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  userAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDEB9D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitial: {
    color: '#2C6842',
    fontSize: 11,
    fontWeight: '800',
  },
  userNameHeader: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 90,
  },
  desktopNavStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 4,
    paddingBottom: 2,
  },
  navTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  navTabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#DDEB9D',
  },
  navTabText: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  navTabTextActive: {
    color: '#DDEB9D',
    fontWeight: '800',
  },

  // ─── Content Container ──────────────────────────────────────────────────────
  contentContainer: {
    maxWidth: 1680,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  mobileKeywordsScroll: {
    gap: 6,
    paddingBottom: 8,
  },
  mobileKwChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileKwChipActive: {
    backgroundColor: '#EDF7EE',
    borderColor: '#2C6842',
  },
  mobileKwText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  mobileKwTextActive: {
    color: '#2C6842',
    fontWeight: '800',
  },
  categoryBarWrap: {
    marginVertical: 6,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EDF7EE',
    borderColor: '#2C6842',
  },
  chipText: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#2C6842',
    fontWeight: '800',
  },
  sortResultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: '#C6E7CE',
  },
  resultBadgeText: {
    color: '#2C6842',
    fontSize: 11,
    fontWeight: '800',
  },
  resultQueryText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  wishlistFilterPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  wishlistFilterPillText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '700',
  },
  sortActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopSortChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortChipActive: {
    backgroundColor: '#2C6842',
    borderColor: '#2C6842',
  },
  sortChipText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#2C6842',
    borderColor: '#2C6842',
  },
  filterButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2C6842',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterPanel: {
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: '#C6E7CE',
    paddingHorizontal: 14,
  },
  filterTitle: {
    color: '#2C6842',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingBottom: 12,
  },
  // ─── Product Grid ──────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF7EE',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#0F1713',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyDesc: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
    maxWidth: 380,
  },
  emptyReset: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2C6842',
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
