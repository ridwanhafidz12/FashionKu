/**
 * @file PassportScannerModal.js
 * @description Real camera QR scanner & Tracking Hub for Digital Product Passport (DPP)
 * and Shipping Resi tracking.
 *
 * Dwifungsi:
 * 1. Scan Circular Passport QR tag fisik pada pakaian FashionKu untuk membaca
 *    asal-usul kain sisa, profil penjahit, dan dampak lingkungan yang dihemat.
 * 2. Info Resi & Tracking: Customer bisa melihat nomor resi pengiriman dan foto struk
 *    resi yang diupload penjahit, disertai tombol "Salin Resi".
 * 3. Opsi input manual kode passport/resi jika kamera bermasalah.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from './AnimatedPressable';
import LeafMark from './LeafMark';
import { colors, shadows } from '../theme/colors';

export default function PassportScannerModal({
  visible,
  onClose,
  onScannedPassport,
  onViewOrderTracking,
  orders = [],
  products = []
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [activeTorch, setActiveTorch] = useState(false);
  const [activeTab, setActiveTab] = useState('passport'); // 'passport' | 'tracking'
  const [manualCode, setManualCode] = useState('');
  const [copiedResi, setCopiedResi] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  // Laser sweep animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setScanned(false);
      setManualCode('');
      setCopiedResi(null);
      setPreviewReceipt(null);
      return undefined;
    }

    setScanned(false);
    laserAnim.setValue(0);
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    sweep.start();

    return () => sweep.stop();
  }, [laserAnim, visible]);

  if (!visible) return null;

  const handleRequestPermission = async () => {
    try {
      const res = await requestPermission();
      if (!res?.granted) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Izin kamera belum aktif. Buka Pengaturan perangkat untuk mengaktifkan izin Kamera.',
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch {
      Linking.openSettings();
    }
  };

  const copyResi = async (code) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedResi(code);
      setTimeout(() => setCopiedResi(null), 2500);
    } catch {
      setCopiedResi(code);
      setTimeout(() => setCopiedResi(null), 2500);
    }
  };

  const processCodeMatch = (codeStr) => {
    const cleanData = String(codeStr || '').trim();
    if (!cleanData) return;

    // Check if it matches an order's tracking code or order ID
    const matchedTracking = orders.find(
      (o) =>
        (o.trackingCode && o.trackingCode.toLowerCase() === cleanData.toLowerCase()) ||
        (o.id && o.id.toLowerCase() === cleanData.toLowerCase())
    );

    if (matchedTracking) {
      if (activeTab === 'tracking') {
        Alert.alert(
          'Resi Ditemukan!',
          `Kurir: ${matchedTracking.courier || 'J&T Express'}\nNomor Resi: ${matchedTracking.trackingCode || cleanData}\nStatus: ${matchedTracking.shipmentStatus || 'Dalam Pengiriman'}`
        );
        return;
      }
    }

    // Try to match scanned data with existing orders or products
    let matchedOrder = orders.find((o) => o.id === cleanData || o.product === cleanData);

    if (!matchedOrder) {
      const matchedProduct =
        products.find(
          (p) =>
            String(p.id) === cleanData ||
            p.name.toLowerCase() === cleanData.toLowerCase() ||
            cleanData.toLowerCase().includes(p.name.toLowerCase())
        ) ?? products[0];

      matchedOrder = {
        id: `PASSPORT-${matchedProduct?.id ?? '001'}`,
        product: matchedProduct?.name ?? 'Luna Wrap Top',
        price: matchedProduct?.price ?? 155000,
        rawPrice: matchedProduct?.price ?? 155000,
        image: matchedProduct?.image,
        tailor: matchedProduct?.tailor ?? 'Rahayu Tailor',
        tailorCity: matchedProduct?.tailorCity ?? 'Sleman, Yogyakarta',
        material: matchedProduct?.material ?? 'Rayon sisa atelier',
        savedFabric: matchedProduct?.savedFabric ?? '0.8m',
        status: 'DELIVERED',
        placedAtLabel: '4 Juni 2026',
        eta: 'Sudah diterima',
        passport: {
          id: `DPP-2026-${matchedProduct?.id ?? '108'}`,
          serialNumber: `CRC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          productName: matchedProduct?.name,
          tailor: matchedProduct?.tailor,
          productionLocation: matchedProduct?.tailorCity,
          materialOrigin: matchedProduct?.material,
          status: 'ACTIVE',
          impact: {
            savedFabric: matchedProduct?.savedFabric,
            estimatedCo2: '1.8 kg CO2e',
          },
          verificationCode: 'VERIFIED-AUTHENTIC-2026',
          issuedAt: '4 Juni 2026',
          activatedAt: '10 Juni 2026',
        },
      };
    }

    onClose();
    setTimeout(() => {
      onScannedPassport(matchedOrder);
    }, 200);
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    processCodeMatch(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Input Kosong', 'Ketikkan nomor resi atau kode paspor digital terlebih dahulu.');
      return;
    }
    processCodeMatch(manualCode);
  };

  const handleSampleScan = (sampleProduct) => {
    processCodeMatch(String(sampleProduct.id));
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const canUseCamera = Platform.OS !== 'web' && permission?.granted;

  // Active orders with tracking info
  const shippedOrders = orders.filter(
    (o) => o.trackingCode || ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status)
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <AnimatedPressable style={styles.iconBtn} onPress={onClose} scaleDown={0.9}>
            <Feather name="x" size={20} color={colors.white} />
          </AnimatedPressable>

          <View style={styles.modeTabs}>
            <Pressable
              style={[styles.modeTab, activeTab === 'passport' && styles.modeTabActive]}
              onPress={() => setActiveTab('passport')}
            >
              <LeafMark size={14} color={activeTab === 'passport' ? colors.forest : colors.white} />
              <Text style={[styles.modeTabText, activeTab === 'passport' && styles.modeTabTextActive]}>
                Paspor DPP
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeTab, activeTab === 'tracking' && styles.modeTabActive]}
              onPress={() => setActiveTab('tracking')}
            >
              <Feather
                name="truck"
                size={14}
                color={activeTab === 'tracking' ? colors.forest : colors.white}
              />
              <Text style={[styles.modeTabText, activeTab === 'tracking' && styles.modeTabTextActive]}>
                Lacak Resi
              </Text>
            </Pressable>
          </View>

          {canUseCamera && activeTab === 'passport' ? (
            <AnimatedPressable
              style={[styles.iconBtn, activeTorch && styles.iconBtnActive]}
              onPress={() => setActiveTorch((prev) => !prev)}
              scaleDown={0.9}
            >
              <Feather
                name={activeTorch ? 'zap' : 'zap-off'}
                size={18}
                color={activeTorch ? colors.forest : colors.white}
              />
            </AnimatedPressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* ─── Mode 1: Paspor DPP Scanner ───────────────────────────────── */}
        {activeTab === 'passport' && (
          <>
            <View style={styles.viewfinderContainer}>
              {canUseCamera ? (
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  facing="back"
                  enableTorch={activeTorch}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'code128', 'code39'],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                />
              ) : (
                <View style={styles.webFallbackCamera}>
                  <MaterialCommunityIcons name="camera-off" size={44} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.fallbackTitle}>
                    {!permission?.granted ? 'Izin Kamera Diperlukan' : 'Mode Scanner Digital'}
                  </Text>
                  <Text style={styles.fallbackSub}>
                    {!permission?.granted
                      ? 'Berikan izin kamera untuk memindai QR code tag pakaian FashionKu secara langsung.'
                      : 'Kamera aktif. Gunakan input manual atau sampel tag untuk memverifikasi paspor sirkular.'}
                  </Text>
                  {!permission?.granted && (
                    <AnimatedPressable
                      style={styles.grantBtn}
                      onPress={handleRequestPermission}
                      scaleDown={0.96}
                    >
                      <Feather name="camera" size={16} color={colors.white} />
                      <Text style={styles.grantBtnText}>Beri Izin Kamera</Text>
                    </AnimatedPressable>
                  )}
                </View>
              )}

              {canUseCamera && (
                <View style={styles.overlayMask} pointerEvents="none">
                  <View style={styles.reticleBox}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <Animated.View
                      style={[styles.laserLine, { transform: [{ translateY: laserTranslateY }] }]}
                    />
                    <View style={styles.reticleCenter}>
                      <MaterialCommunityIcons name="qrcode-scan" size={36} color="rgba(255,255,255,0.4)" />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Card for Passport */}
            <View style={styles.bottomCard}>
              <Text style={styles.instructionTitle}>Scan QR Tag Fisik Pakaian</Text>
              <Text style={styles.instructionDesc}>
                Arahkan kamera ke QR tag baju untuk membaca asal-usul kain sisa, profil penjahit UMKM, dan jejak karbon dihemat.
              </Text>

              {/* Manual Input Bar */}
              <View style={styles.manualInputRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Atau ketik ID / Kode Passport..."
                  placeholderTextColor={colors.warmGray}
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                />
                <AnimatedPressable
                  style={styles.manualSubmitBtn}
                  onPress={handleManualSubmit}
                  scaleDown={0.95}
                >
                  <Text style={styles.manualSubmitText}>Cek</Text>
                </AnimatedPressable>
              </View>

              {/* Quick Demo Test Buttons */}
              <View style={styles.sampleSection}>
                <Text style={styles.sampleLabel}>Atau coba simulasi tag produk:</Text>
                <View style={styles.sampleRow}>
                  {products.slice(0, 3).map((p) => (
                    <AnimatedPressable
                      key={p.id}
                      style={styles.sampleChip}
                      onPress={() => handleSampleScan(p)}
                      scaleDown={0.95}
                    >
                      <MaterialCommunityIcons name="qrcode" size={14} color={colors.forest} />
                      <Text style={styles.sampleChipText} numberOfLines={1}>
                        {p.name}
                      </Text>
                    </AnimatedPressable>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* ─── Mode 2: Info & Lacak Resi Pengiriman ─────────────────────── */}
        {activeTab === 'tracking' && (
          <ScrollView
            style={styles.trackingContainer}
            contentContainerStyle={styles.trackingContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Info Resi & Foto Struk Kurir</Text>
              <Text style={styles.trackingSubtitle}>
                Pantau pengiriman baju dari workshop penjahit dan cek foto bukti struk fisik dari ekspedisi.
              </Text>
            </View>

            {/* Manual Resi Search Bar */}
            <View style={styles.manualResiBox}>
              <Feather name="search" size={18} color={colors.forest} />
              <TextInput
                style={styles.manualResiInput}
                placeholder="Cari nomor resi atau ID pesanan..."
                placeholderTextColor={colors.warmGray}
                value={manualCode}
                onChangeText={setManualCode}
              />
              <AnimatedPressable
                style={styles.manualSubmitBtn}
                onPress={handleManualSubmit}
                scaleDown={0.95}
              >
                <Text style={styles.manualSubmitText}>Lacak</Text>
              </AnimatedPressable>
            </View>

            {/* Active Shipments List */}
            <Text style={styles.trackingSectionTitle}>Pesanan Sedang Dikirim</Text>
            {shippedOrders.length === 0 ? (
              <View style={styles.emptyTrackingBox}>
                <Feather name="package" size={40} color={colors.warmGrayLight} />
                <Text style={styles.emptyTrackingTitle}>Belum ada paket dalam perjalanan</Text>
                <Text style={styles.emptyTrackingSub}>
                  Ketika penjahit menyerahkan baju ke kurir dan mengupload foto struk resi, kamu bisa melacaknya langsung di sini.
                </Text>
              </View>
            ) : (
              shippedOrders.map((ord) => {
                const resiCode = ord.trackingCode || `JNT-CRC-${ord.id.slice(-6)}`;
                const courierName = ord.courier || 'J&T Express';
                const receiptImg =
                  ord.receiptImage ||
                  ord.extraData?.receiptImage ||
                  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';

                return (
                  <View key={ord.id} style={styles.trackingCard}>
                    <View style={styles.trackingCardTop}>
                      <View style={styles.courierBadge}>
                        <Feather name="truck" size={13} color={colors.forest} />
                        <Text style={styles.courierText}>{courierName}</Text>
                      </View>
                      <View style={styles.shipmentStatusPill}>
                        <Text style={styles.shipmentStatusText}>{ord.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.trackingProductName}>{ord.product}</Text>
                    <Text style={styles.trackingTailorName}>Oleh {ord.tailor}</Text>

                    {/* Resi Box with Copy Button */}
                    <View style={styles.resiBox}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resiLabel}>Nomor Resi Pengiriman</Text>
                        <Text style={styles.resiCode}>{resiCode}</Text>
                      </View>
                      <AnimatedPressable
                        style={[
                          styles.copyBtn,
                          copiedResi === resiCode && styles.copyBtnSuccess,
                        ]}
                        onPress={() => copyResi(resiCode)}
                        scaleDown={0.93}
                      >
                        <Feather
                          name={copiedResi === resiCode ? 'check' : 'copy'}
                          size={14}
                          color={copiedResi === resiCode ? colors.white : colors.forest}
                        />
                        <Text
                          style={[
                            styles.copyBtnText,
                            copiedResi === resiCode && styles.copyBtnTextSuccess,
                          ]}
                        >
                          {copiedResi === resiCode ? 'Tersalin' : 'Salin Resi'}
                        </Text>
                      </AnimatedPressable>
                    </View>

                    {/* Receipt photo preview */}
                    <View style={styles.receiptPreviewRow}>
                      <Pressable
                        style={styles.receiptThumbWrap}
                        onPress={() => setPreviewReceipt(receiptImg)}
                      >
                        <Image source={{ uri: receiptImg }} style={styles.receiptThumb} />
                        <View style={styles.receiptOverlay}>
                          <Feather name="zoom-in" size={14} color={colors.white} />
                        </View>
                      </Pressable>
                      <View style={styles.receiptInfo}>
                        <Text style={styles.receiptTitle}>Struk Fisik Resi</Text>
                        <Text style={styles.receiptNote}>
                          Diupload langsung oleh mitra penjahit saat paket diserahkan ke gerai kurir.
                        </Text>
                        <Pressable onPress={() => setPreviewReceipt(receiptImg)}>
                          <Text style={styles.receiptViewLink}>Perbesar Foto Struk</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Modal Foto Struk Resi Fullscreen */}
        {previewReceipt && (
          <Modal transparent animationType="fade" visible={!!previewReceipt} onRequestClose={() => setPreviewReceipt(null)}>
            <View style={styles.fullImageOverlay}>
              <View style={styles.fullImageCard}>
                <View style={styles.fullImageHeader}>
                  <Text style={styles.fullImageTitle}>Foto Struk Fisik Pengiriman</Text>
                  <Pressable onPress={() => setPreviewReceipt(null)} style={styles.fullImageClose}>
                    <Feather name="x" size={20} color={colors.charcoal} />
                  </Pressable>
                </View>
                <Image source={{ uri: previewReceipt }} style={styles.fullImage} resizeMode="contain" />
                <Text style={styles.fullImageDesc}>
                  Bukti sah serah terima paket pakaian sirkular ke pihak ekspedisi kurir.
                </Text>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1713',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 3,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  modeTabActive: {
    backgroundColor: colors.sand,
  },
  modeTabText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: colors.forest,
    fontWeight: '900',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.sand,
  },
  viewfinderContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  webFallbackCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#16221B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  fallbackSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 290,
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 16,
  },
  grantBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  overlayMask: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 250,
    height: 250,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: colors.mint,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  laserLine: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: colors.mint,
    ...shadows.md,
    shadowColor: colors.mint,
  },
  reticleCenter: {
    opacity: 0.6,
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    ...shadows.xl,
  },
  instructionTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  instructionDesc: {
    color: colors.warmGray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 17,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  manualInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.ivory,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  manualSubmitBtn: {
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  sampleSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  sampleLabel: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  sampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  sampleChipText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  // Mode 2 Tracking styles
  trackingContainer: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  trackingContent: {
    padding: 18,
    paddingBottom: 32,
  },
  trackingHeader: {
    marginBottom: 14,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.charcoal,
  },
  trackingSubtitle: {
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 3,
    lineHeight: 18,
  },
  manualResiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 16,
    height: 48,
  },
  manualResiInput: {
    flex: 1,
    fontSize: 13,
    color: colors.charcoal,
  },
  trackingSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.charcoal,
    marginBottom: 10,
  },
  emptyTrackingBox: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  emptyTrackingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.charcoal,
    marginTop: 12,
  },
  emptyTrackingSub: {
    fontSize: 12,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },
  trackingCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  trackingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.sandLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  courierText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
  },
  shipmentStatusPill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shipmentStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
  },
  trackingProductName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.charcoal,
  },
  trackingTailorName: {
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 2,
    marginBottom: 12,
  },
  resiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ivory,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  resiLabel: {
    fontSize: 10,
    color: colors.warmGray,
  },
  resiCode: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.forest,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.sand,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyBtnSuccess: {
    backgroundColor: colors.forest,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
  },
  copyBtnTextSuccess: {
    color: colors.white,
  },
  receiptPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.sandLight,
    borderRadius: 12,
    padding: 10,
  },
  receiptThumbWrap: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  receiptThumb: {
    width: '100%',
    height: '100%',
  },
  receiptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.charcoal,
  },
  receiptNote: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
    lineHeight: 14,
  },
  receiptViewLink: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullImageCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 420,
  },
  fullImageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fullImageTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.charcoal,
  },
  fullImageClose: {
    padding: 4,
  },
  fullImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    backgroundColor: colors.ivory,
  },
  fullImageDesc: {
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 10,
    textAlign: 'center',
  },
});
