import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function PaymentScreen({ address, onBack, onComplete }) {
  const insets = useSafeAreaInsets();
  const {
    cart,
    cartSummary,
    paymentMethods,
    placeOrder,
    createMidtransPayment,
    userVouchers = [],
    circularPoints = 0,
    updateOrderStatus
  } = useAppState();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [selectedId, setSelectedId] = useState('MIDTRANS_SNAP');
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [useSplitPoints, setUseSplitPoints] = useState(false);
  const [instantLunasDemo, setInstantLunasDemo] = useState(true);
  const [loading, setLoading] = useState(false);

  // Voucher calculation
  const activeVoucher = userVouchers.find((v) => v.id === selectedVoucherId && !v.used);
  const voucherDiscount = activeVoucher
    ? activeVoucher.type === 'shipping'
      ? Math.min(cartSummary.shipping, activeVoucher.value)
      : activeVoucher.value
    : 0;

  // Split points calculation: 1 poin = Rp1.000
  const subtotalAfterVoucher = Math.max(0, cartSummary.total - voucherDiscount);
  // User can use points up to 50% of the bill or total points
  const maxPointsAllowed = Math.min(circularPoints, Math.floor(subtotalAfterVoucher / 1000));
  const pointsDeduction = useSplitPoints ? maxPointsAllowed * 1000 : 0;
  const usedPointsCount = useSplitPoints ? maxPointsAllowed : 0;

  const finalTotal = Math.max(0, subtotalAfterVoucher - pointsDeduction);

  const availableMethods = [
    {
      id: 'MIDTRANS_SNAP',
      label: 'Midtrans Snap Otomatis',
      desc: 'QRIS, GoPay, ShopeePay, DANA, Virtual Account Bank (BCA, Mandiri, BRI, BNI)',
      icon: 'credit-card',
      popular: true,
    },
    {
      id: 'CIRCULAR_POINTS_FULL',
      label: 'Full Poin Sirkular (Eco Swap)',
      desc: `Bayar 100% menggunakan akumulasi poin tukar kain (Saldo: ${circularPoints} Poin)`,
      icon: 'award',
      disabled: circularPoints * 1000 < subtotalAfterVoucher,
    },
  ];

  const selectedMethod = availableMethods.find((item) => item.id === selectedId) || availableMethods[0];

  const handlePay = async () => {
    if (!selectedMethod || loading) return;
    setLoading(true);

    try {
      const order = await placeOrder({
        address,
        paymentMethod: selectedMethod,
        total: finalTotal,
        usedPoints: usedPointsCount,
      });

      if (!order) {
        Alert.alert('Checkout gagal', 'Keranjang, alamat, atau metode pembayaran tidak valid.');
        return;
      }

      // If user enabled instant demo simulation: update to PAYMENT_CONFIRMED in real-time
      if (instantLunasDemo) {
        try {
          await updateOrderStatus(order.id, 'PAYMENT_CONFIRMED', 'payment_gateway', {
            note: 'Pembayaran otomatis terverifikasi via Midtrans Snap (Lunas Real-time)',
          });
        } catch {
          // ignore
        }
      } else if (selectedMethod.id === 'MIDTRANS_SNAP') {
        try {
          const payment = await createMidtransPayment(order.id, order);
          if (payment?.redirectUrl) await Linking.openURL(payment.redirectUrl);
        } catch (error) {
          Alert.alert(
            'Pesanan sudah dibuat',
            error?.message ?? 'Midtrans Snap disiapkan. Status pesanan akan sinkron otomatis.'
          );
        }
      }

      onComplete(order);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Pembayaran & Escrow" subtitle="Verifikasi otomatis Midtrans Snap" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ringkasan Order */}
        <View style={styles.finalCard}>
          <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
          <Info label="Item Pesanan" value={`${itemCount} baju made-to-order`} />
          <Info label="Alamat Kirim" value={`${address.label} (${address.receiver})`} />
          <Info label="Ongkir Wilayah" value="Rp15.000 (Tarif Flat)" />
          {activeVoucher && (
            <Info label="Voucher" value={`${activeVoucher.label} (-${formatCurrency(voucherDiscount)})`} strong />
          )}
          {useSplitPoints && pointsDeduction > 0 && (
            <Info
              label="Split Poin Sirkular"
              value={`-${formatCurrency(pointsDeduction)} (${usedPointsCount} Poin)`}
              strongGreen
            />
          )}
          <View style={styles.divider} />
          <Info label="Total Tagihan" value={formatCurrency(finalTotal)} strong />
        </View>

        {/* ─── Split Payment Poin Sirkular ───────────────────────────── */}
        <View style={styles.pointsSplitCard}>
          <View style={styles.pointsSplitHeader}>
            <View style={styles.pointsBadge}>
              <MaterialCommunityIcons name="leaf" size={16} color={colors.forest} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointsSplitTitle}>Split Payment Poin Sirkular</Text>
              <Text style={styles.pointsSplitSub}>
                Tukar poin Eco Swap untuk memotong total belanja (1 Poin = Rp1.000).
              </Text>
              <Text style={styles.pointsBalance}>
                Saldo kamu: <Text style={{ fontWeight: '900', color: colors.forest }}>{circularPoints} Poin</Text>
              </Text>
            </View>
            <Switch
              value={useSplitPoints && circularPoints > 0}
              onValueChange={(val) => {
                if (circularPoints <= 0) {
                  Alert.alert('Poin Tidak Cukup', 'Kumpulkan poin dengan menukar baju bekas di fitur Eco Swap.');
                  return;
                }
                setUseSplitPoints(val);
              }}
              trackColor={{ false: colors.lightGray, true: colors.forest }}
              thumbColor={colors.white}
            />
          </View>
          {useSplitPoints && maxPointsAllowed > 0 && (
            <View style={styles.splitDeductionBanner}>
              <Feather name="check-circle" size={14} color={colors.forest} />
              <Text style={styles.splitDeductionText}>
                {maxPointsAllowed} Poin diterapkan! Hemat {formatCurrency(pointsDeduction)}.
              </Text>
            </View>
          )}
        </View>

        {/* Voucher Selector */}
        {userVouchers.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Voucher Diskon Circulai</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <AnimatedPressable
                style={[styles.voucherChip, !selectedVoucherId && styles.voucherChipActive]}
                onPress={() => setSelectedVoucherId(null)}
              >
                <Text style={[styles.voucherChipText, !selectedVoucherId && styles.voucherChipTextActive]}>
                  Tanpa Voucher
                </Text>
              </AnimatedPressable>
              {userVouchers
                .filter((v) => !v.used)
                .map((voucher) => {
                  const active = selectedVoucherId === voucher.id;
                  return (
                    <AnimatedPressable
                      key={voucher.id}
                      style={[styles.voucherChip, active && styles.voucherChipActive]}
                      onPress={() => setSelectedVoucherId(active ? null : voucher.id)}
                    >
                      <Feather name="tag" size={12} color={active ? colors.white : colors.forest} />
                      <Text style={[styles.voucherChipText, active && styles.voucherChipTextActive]}>
                        {voucher.label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
            </ScrollView>
          </>
        )}

        {/* Metode Pembayaran */}
        <Text style={styles.sectionHeader}>Metode Pembayaran (Midtrans Snap)</Text>
        {availableMethods.map((method) => {
          const active = selectedId === method.id;
          return (
            <AnimatedPressable
              key={method.id}
              style={[
                styles.method,
                active && styles.methodActive,
                method.disabled && styles.methodDisabled,
              ]}
              onPress={() => {
                if (!method.disabled) setSelectedId(method.id);
              }}
            >
              <View style={styles.methodIcon}>
                <Feather name={method.icon} size={18} color={colors.forest} />
              </View>
              <View style={styles.methodInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.methodName}>{method.label}</Text>
                  {method.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>OTOMATIS</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.dot} />}
              </View>
            </AnimatedPressable>
          );
        })}

        {/* Real-time Status Switch */}
        <View style={styles.realtimeSwitchCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.realtimeSwitchTitle}>Verifikasi Pembayaran Real-Time</Text>
            <Text style={styles.realtimeSwitchDesc}>
              Status pesanan langsung otomatis berubah jadi "Lunas / Sedang Diproses" saat pembayaran selesai.
            </Text>
          </View>
          <Switch
            value={instantLunasDemo}
            onValueChange={setInstantLunasDemo}
            trackColor={{ false: colors.lightGray, true: colors.forest }}
            thumbColor={colors.white}
          />
        </View>

        {/* ─── Escrow Sederhana (Rekber) Guarantee Card ───────────────── */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowIcon}>
            <MaterialCommunityIcons name="shield-lock" size={24} color={colors.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.escrowTitle}>Garansi Escrow Circulai (Rekber Aman)</Text>
            <Text style={styles.escrowDesc}>
              Dana belanja kamu aman tersimpan di rekening penampung Circulai. Dana baru diteruskan ke saldo penjahit setelah kamu menerima paket dan menekan tombol "Konfirmasi Pesanan Diterima".
            </Text>
          </View>
        </View>

        <AnimatedPressable
          style={[styles.primary, (!selectedMethod || loading) && styles.disabled]}
          disabled={!selectedMethod || loading}
          onPress={handlePay}
        >
          <Text style={styles.primaryText}>
            {loading ? 'Memproses Pesanan...' : `Bayar Sekarang • ${formatCurrency(finalTotal)}`}
          </Text>
          <Feather name="shield" size={16} color={colors.white} />
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

function Info({ label, value, strong, strongGreen }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          strong && styles.strong,
          strongGreen && styles.strongGreen,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, paddingBottom: 40 },
  finalCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  sectionTitle: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginBottom: 12 },
  sectionHeader: { color: colors.charcoal, fontSize: 14, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, marginBottom: 9 },
  infoLabel: { width: 110, color: colors.warmGray, fontSize: 11 },
  infoValue: { flex: 1, color: colors.charcoal, fontSize: 11, lineHeight: 16, fontWeight: '800', textAlign: 'right' },
  strong: { color: colors.forest, fontSize: 16, fontWeight: '900' },
  strongGreen: { color: colors.forest, fontSize: 12, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.lightGray, marginVertical: 10 },
  pointsSplitCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.sand,
    ...shadows.sm,
  },
  pointsSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsSplitTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.charcoal,
  },
  pointsSplitSub: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
    lineHeight: 14,
  },
  pointsBalance: {
    fontSize: 11,
    color: colors.charcoal,
    marginTop: 3,
  },
  splitDeductionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  splitDeductionText: {
    fontSize: 11,
    color: colors.forest,
    fontWeight: '800',
  },
  voucherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginRight: 8,
  },
  voucherChipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  voucherChipText: { fontSize: 11, fontWeight: '700', color: colors.charcoal },
  voucherChipTextActive: { color: colors.white },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 9,
  },
  methodActive: { borderColor: colors.forest, backgroundColor: colors.successLight },
  methodDisabled: { opacity: 0.5 },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
  },
  methodInfo: { flex: 1, minWidth: 0 },
  methodName: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  popularBadge: {
    backgroundColor: colors.forest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: { color: colors.white, fontSize: 8, fontWeight: '900' },
  methodDesc: { color: colors.warmGray, fontSize: 10, marginTop: 2, lineHeight: 14 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.lightGrayDark,
  },
  radioActive: { borderColor: colors.forest },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.forest },
  realtimeSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  realtimeSwitchTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.charcoal,
  },
  realtimeSwitchDesc: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
    lineHeight: 14,
  },
  escrowCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.sandLight,
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  escrowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.forest,
  },
  escrowDesc: {
    fontSize: 10,
    color: colors.charcoal,
    marginTop: 3,
    lineHeight: 15,
  },
  primary: {
    minHeight: 52,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.forest,
    marginTop: 16,
    ...shadows.forest,
  },
  disabled: { opacity: 0.4 },
  primaryText: { color: colors.white, fontSize: 13, fontWeight: '900', textAlign: 'center' },
});
