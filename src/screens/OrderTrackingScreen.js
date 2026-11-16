import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import HelpCenterModal from '../components/HelpCenterModal';
import { canRequestReturn, getOrderTimeline, orderStatusIndex, returnStatusMeta } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function OrderTrackingScreen({
  orderId,
  onBack,
  onViewDetails,
  onChatTailor,
  onRequestReturn,
  onPayOrder
}) {
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus, createMidtransPayment, backend, setNotice } = useAppState();
  const [now, setNow] = useState(Date.now());
  const [openingPayment, setOpeningPayment] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    return (
      <View style={styles.screen}>
        <FlowHeader title="Tracking Pesanan" onBack={onBack} />
        <Text style={styles.notFound}>Pesanan tidak ditemukan.</Text>
      </View>
    );
  }

  const timeline = getOrderTimeline(order);
  const currentIndex = orderStatusIndex(order.status);
  const current = timeline[currentIndex];
  const shipped = ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status);
  const returnable = canRequestReturn(order);
  const returnMeta = order.returnRequest
    ? returnStatusMeta[order.returnRequest.status] ?? returnStatusMeta.REVIEWING
    : null;
  const paymentExpired =
    order.status === 'WAITING_PAYMENT' &&
    order.paymentData?.expiresAt &&
    new Date(order.paymentData.expiresAt).getTime() <= now;

  const resiCode = order.trackingCode || `JNT-CRC-${order.id.slice(-6)}`;
  const courierName = order.courier || 'J&T Express';
  const receiptImg =
    order.receiptImage ||
    order.extraData?.receiptImage ||
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';

  const continuePayment = async () => {
    if (openingPayment) return;
    if (onPayOrder) {
      onPayOrder(order);
      return;
    }
    setOpeningPayment(true);
    try {
      const payment = await createMidtransPayment(order.id);
      if (payment?.redirectUrl) await Linking.openURL(payment.redirectUrl);
      await backend.refresh({ silent: true });
    } catch (error) {
      Alert.alert('Midtrans belum dapat dibuka', error?.message ?? 'Silakan coba lagi beberapa saat.');
    } finally {
      setOpeningPayment(false);
    }
  };

  const copyResi = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(resiCode);
      }
      setCopiedResi(true);
      setNotice?.('Nomor resi berhasil disalin!');
      setTimeout(() => setCopiedResi(false), 2500);
    } catch {
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2500);
    }
  };

  const handleConfirmReceived = () => {
    Alert.alert(
      'Konfirmasi Pesanan Diterima?',
      'Pastikan baju telah sampai dan fitting pas. Dana rekber akan dicairkan ke saldo mitra penjahit.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Diterima & Sesuai',
          onPress: async () => {
            await updateOrderStatus(order.id, 'COMPLETED', 'customer');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Tracking Pesanan" subtitle={order.id} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.hero}>
          <Image source={{ uri: order.image }} style={styles.image} />
          <View style={styles.heroInfo}>
            <Text style={styles.product}>{order.product}</Text>
            <Text style={styles.tailor}>oleh {order.tailor}</Text>
            <Text style={styles.status}>{current.label}</Text>
          </View>
          <Text style={styles.percent}>{Math.round(((currentIndex + 1) / timeline.length) * 100)}%</Text>
        </View>

        <View style={styles.estimateCard}>
          <Feather name="clock" size={16} color={colors.forest} />
          <View>
            <Text style={styles.estimateLabel}>Estimasi tahap sekarang</Text>
            <Text style={styles.estimateValue}>{current.estimate}</Text>
          </View>
        </View>

        {/* Timeline Made-to-Order */}
        <Text style={styles.sectionTitle}>Timeline Made-to-Order</Text>
        <View style={styles.timelineCard}>
          {timeline.map((step, index) => {
            const completed = step.state === 'completed';
            const active = step.state === 'current';
            const history = order.statusHistory?.find((item) => item.status === step.id);
            return (
              <View key={step.id} style={styles.timelineRow}>
                <View style={styles.rail}>
                  <View style={[styles.dot, (completed || active) && styles.dotActive]}>
                    {completed ? (
                      <Feather name="check" size={11} color={colors.white} />
                    ) : active ? (
                      <View style={styles.dotInner} />
                    ) : null}
                  </View>
                  {index < timeline.length - 1 && (
                    <View style={[styles.line, completed && styles.lineActive]} />
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <View style={styles.stepTop}>
                    <Text style={[styles.stepTitle, active && styles.stepTitleActive]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepEstimate}>{step.estimate}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                  {!!history && (
                    <Text style={styles.history}>
                      {history.label} - {history.note}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Informasi Tailor */}
        <Text style={styles.sectionTitle}>Informasi Tailor</Text>
        {(order.tailorProfiles?.length ? order.tailorProfiles : [order.tailorProfile]).map(
          (tailor, index) => (
            <View
              key={tailor?.id ?? tailor?.name ?? index}
              style={[styles.tailorCard, index > 0 && styles.tailorSpacing]}
            >
              <View style={styles.tailorIcon}>
                <Feather name="user" size={20} color={colors.forest} />
              </View>
              <View style={styles.tailorInfo}>
                <Text style={styles.tailorName}>{tailor?.name ?? order.tailor}</Text>
                <Text style={styles.tailorMeta}>{tailor?.specialty}</Text>
                <Text style={styles.tailorMeta}>
                  {tailor?.city ?? order.tailorCity} - {tailor?.experience}
                </Text>
              </View>
              <AnimatedPressable
                style={styles.chatTailor}
                onPress={() => onChatTailor(tailor?.name ?? order.tailor, order)}
                scaleDown={0.9}
              >
                <Feather name="message-circle" size={16} color={colors.forest} />
              </AnimatedPressable>
            </View>
          )
        )}

        {/* Tracking Paket & Foto Struk Resi */}
        {shipped && (
          <>
            <Text style={styles.sectionTitle}>Tracking Paket & Bukti Ekspedisi</Text>
            <View style={styles.shipment}>
              <View style={styles.shipmentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataLabel}>Kurir Pengiriman</Text>
                  <Text style={styles.dataValueBold}>{courierName}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{order.shipmentStatus || 'Dalam Pengiriman'}</Text>
                </View>
              </View>

              <View style={styles.resiBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dataLabel}>Nomor Resi</Text>
                  <Text style={styles.resiText}>{resiCode}</Text>
                </View>
                <AnimatedPressable
                  style={[styles.salinBtn, copiedResi && styles.salinBtnSuccess]}
                  onPress={copyResi}
                  scaleDown={0.93}
                >
                  <Feather
                    name={copiedResi ? 'check' : 'copy'}
                    size={13}
                    color={copiedResi ? colors.white : colors.forest}
                  />
                  <Text style={[styles.salinBtnText, copiedResi && styles.salinBtnTextSuccess]}>
                    {copiedResi ? 'Tersalin' : 'Salin Resi'}
                  </Text>
                </AnimatedPressable>
              </View>

              {/* Foto Struk Resi */}
              <View style={styles.receiptSection}>
                <Text style={styles.dataLabel}>Foto Struk Fisik Resi Penjahit:</Text>
                <Pressable
                  style={styles.receiptThumbWrap}
                  onPress={() => setPreviewReceipt(true)}
                >
                  <Image source={{ uri: receiptImg }} style={styles.receiptThumb} />
                  <View style={styles.receiptOverlay}>
                    <Feather name="maximize-2" size={16} color={colors.white} />
                    <Text style={styles.receiptOverlayText}>Lihat Struk</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {paymentExpired && (
          <View style={styles.expiredNotice}>
            <Feather name="alert-circle" size={15} color={colors.error} />
            <Text style={styles.expiredText}>Batas pembayaran telah berakhir.</Text>
          </View>
        )}

        {order.status === 'WAITING_PAYMENT' && !paymentExpired && (
          <AnimatedPressable
            style={[styles.primary, openingPayment && styles.disabled]}
            disabled={openingPayment}
            onPress={continuePayment}
          >
            <Text style={styles.primaryText}>
              {openingPayment ? 'Membuka Midtrans...' : 'Lanjutkan Pembayaran'}
            </Text>
          </AnimatedPressable>
        )}

        {/* Konfirmasi Pesanan Diterima (Escrow release) */}
        {['SHIPPED', 'DELIVERED'].includes(order.status) && (
          <AnimatedPressable
            style={styles.confirmReceivedBtn}
            onPress={handleConfirmReceived}
            scaleDown={0.97}
          >
            <MaterialCommunityIcons name="shield-check" size={20} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.confirmReceivedText}>Konfirmasi Pesanan Diterima</Text>
              <Text style={styles.confirmReceivedSub}>
                Baju sudah sampai & pas. Cairkan dana rekber ke penjahit.
              </Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.white} />
          </AnimatedPressable>
        )}

        {order.status === 'COMPLETED' && (
          <View style={styles.completedNotice}>
            <Feather name="check-circle" size={18} color={colors.forest} />
            <View style={{ flex: 1 }}>
              <Text style={styles.completedNoticeTitle}>Pesanan Telah Selesai</Text>
              <Text style={styles.completedNoticeSub}>
                Dana rekber telah diteruskan ke saldo mitra penjahit. Terima kasih telah mendukung sirkular fashion!
              </Text>
            </View>
          </View>
        )}

        {/* Tombol Pusat Bantuan / Komplain */}
        <AnimatedPressable
          style={styles.helpButton}
          onPress={() => setShowHelpModal(true)}
          scaleDown={0.97}
        >
          <View style={styles.helpIconWrap}>
            <Feather name="help-circle" size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.helpButtonTitle}>Pusat Bantuan & Komplain Ukuran</Text>
            <Text style={styles.helpButtonDesc}>
              Kain tidak pas atau ada cacat jahitan? Chat admin untuk penanganan cepat Garansi Pas.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.warmGrayLight} />
        </AnimatedPressable>

        {/* Return Button */}
        {(returnable || order.returnRequest) && (
          <AnimatedPressable
            style={styles.returnButton}
            onPress={() => onRequestReturn(order.id)}
            scaleDown={0.97}
          >
            <View style={styles.returnButtonIcon}>
              <Feather name="rotate-ccw" size={17} color={colors.forest} />
            </View>
            <View style={styles.returnButtonCopy}>
              <Text style={styles.returnButtonTitle}>
                {order.returnRequest ? `Retur ${returnMeta.label}` : 'Ajukan Pengembalian'}
              </Text>
              <Text style={styles.returnButtonDesc}>
                {order.returnRequest
                  ? `${order.returnRequest.reasonLabel} - ${order.returnRequest.id}`
                  : 'Upload foto bukti dan alasan kalau produk tidak sesuai.'}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.warmGrayLight} />
          </AnimatedPressable>
        )}

        <AnimatedPressable style={styles.secondary} onPress={() => onViewDetails(order)}>
          <Text style={styles.secondaryText}>Detail & Circular Passport</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Modal Foto Struk Resi Zoom */}
      {previewReceipt && (
        <Modal transparent animationType="fade" visible={previewReceipt} onRequestClose={() => setPreviewReceipt(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Foto Struk Fisik Pengiriman</Text>
                <Pressable onPress={() => setPreviewReceipt(false)} style={styles.modalClose}>
                  <Feather name="x" size={20} color={colors.charcoal} />
                </Pressable>
              </View>
              <Image source={{ uri: receiptImg }} style={styles.modalImage} resizeMode="contain" />
              <View style={styles.modalFooter}>
                <Text style={styles.modalCaption}>Nomor Resi: {resiCode}</Text>
                <Text style={styles.modalSub}>
                  Foto bukti asli saat penjahit menyerahkan paket ke agen ekspedisi {courierName}.
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal Pusat Bantuan & Komplain */}
      <HelpCenterModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        initialOrder={order}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 20, paddingBottom: 40 },
  notFound: { color: colors.warmGray, textAlign: 'center', marginTop: 80 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.forest,
    ...shadows.md,
  },
  image: { width: 64, height: 76, borderRadius: 14, backgroundColor: colors.sand },
  heroInfo: { flex: 1 },
  product: { color: colors.white, fontSize: 14, fontWeight: '900' },
  tailor: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2 },
  status: { color: colors.mint, fontSize: 11, fontWeight: '800', marginTop: 4 },
  percent: { color: colors.white, fontSize: 18, fontWeight: '900' },
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  estimateLabel: { color: colors.warmGray, fontSize: 10 },
  estimateValue: { color: colors.charcoal, fontSize: 13, fontWeight: '800', marginTop: 2 },
  sectionTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  timelineCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  timelineRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  rail: { alignItems: 'center', width: 20 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.forest },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  line: { width: 2, flex: 1, backgroundColor: colors.lightGray, marginTop: 4 },
  lineActive: { backgroundColor: colors.forest },
  stepInfo: { flex: 1 },
  stepTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { color: colors.charcoal, fontSize: 13, fontWeight: '700' },
  stepTitleActive: { color: colors.forest, fontWeight: '900' },
  stepEstimate: { color: colors.warmGray, fontSize: 10 },
  stepDesc: { color: colors.warmGray, fontSize: 11, marginTop: 2, lineHeight: 15 },
  history: { color: colors.forest, fontSize: 10, marginTop: 4, fontWeight: '700' },
  tailorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  tailorSpacing: { marginTop: 10 },
  tailorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tailorInfo: { flex: 1 },
  tailorName: { color: colors.charcoal, fontSize: 13, fontWeight: '800' },
  tailorMeta: { color: colors.warmGray, fontSize: 10, marginTop: 1 },
  chatTailor: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipment: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  shipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataLabel: { color: colors.warmGray, fontSize: 10 },
  dataValueBold: { color: colors.charcoal, fontSize: 13, fontWeight: '800', marginTop: 2 },
  statusPill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: { color: colors.forest, fontSize: 11, fontWeight: '800' },
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
  resiText: { color: colors.forest, fontSize: 14, fontWeight: '900', marginTop: 2, letterSpacing: 0.5 },
  salinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.sand,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  salinBtnSuccess: { backgroundColor: colors.forest },
  salinBtnText: { color: colors.forest, fontSize: 11, fontWeight: '800' },
  salinBtnTextSuccess: { color: colors.white },
  receiptSection: { marginTop: 4 },
  receiptThumbWrap: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  receiptThumb: { width: '100%', height: '100%' },
  receiptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  receiptOverlayText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  confirmReceivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.forest,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 18,
    ...shadows.forest,
  },
  confirmReceivedText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  confirmReceivedSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2 },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.successLight,
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  completedNoticeTitle: { color: colors.forest, fontSize: 13, fontWeight: '900' },
  completedNoticeSub: { color: colors.charcoal, fontSize: 11, marginTop: 2, lineHeight: 15 },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...shadows.sm,
  },
  helpIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonTitle: { color: colors.charcoal, fontSize: 13, fontWeight: '800' },
  helpButtonDesc: { color: colors.warmGray, fontSize: 10, marginTop: 2, lineHeight: 14 },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  returnButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonCopy: { flex: 1 },
  returnButtonTitle: { color: colors.charcoal, fontSize: 13, fontWeight: '800' },
  returnButtonDesc: { color: colors.warmGray, fontSize: 10, marginTop: 2 },
  primary: {
    backgroundColor: colors.forest,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    ...shadows.forest,
  },
  primaryText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  disabled: { opacity: 0.6 },
  secondary: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  secondaryText: { color: colors.charcoal, fontSize: 13, fontWeight: '800' },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  expiredText: { color: colors.error, fontSize: 12, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 15, fontWeight: '900', color: colors.charcoal },
  modalClose: { padding: 4 },
  modalImage: { width: '100%', height: 320, borderRadius: 12, backgroundColor: colors.ivory },
  modalFooter: { marginTop: 12 },
  modalCaption: { fontSize: 13, fontWeight: '900', color: colors.forest },
  modalSub: { fontSize: 11, color: colors.warmGray, marginTop: 2 },
});
