import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

export default function CartScreen({ onBack, onContinue, onExplore }) {
  const insets = useSafeAreaInsets();
  const { cart, cartSummary, removeFromCart, updateCartQuantity, requireAuth } = useAppState();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleContinue = () => {
    requireAuth(onContinue, 'Silakan masuk ke akun CIRCULAI untuk memilih alamat & membuat pesanan.');
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Keranjang" subtitle={`${itemCount} item made-to-order`} onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="shopping-bag" size={30} color={colors.forest} /></View>
            <Text style={styles.emptyTitle}>Keranjang masih kosong</Text>
            <Text style={styles.emptyText}>Pilih produk dan kustomisasi detailnya terlebih dahulu.</Text>
            <AnimatedPressable style={styles.primary} onPress={onExplore}><Text style={styles.primaryText}>Lihat Katalog</Text></AnimatedPressable>
          </View>
        ) : (
          <>
            {cart.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onDecrease={() => updateCartQuantity(item.cartItemId, -1)}
                onIncrease={() => updateCartQuantity(item.cartItemId, 1)}
                onRemove={() => removeFromCart(item.cartItemId)}
              />
            ))}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Ringkasan Harga</Text>
              <SummaryRow label="Subtotal" value={formatCurrency(cartSummary.subtotal)} />
              <SummaryRow label="Estimasi ongkir" value={formatCurrency(cartSummary.shipping)} />
              <SummaryRow label="Diskon sirkular" value={`-${formatCurrency(cartSummary.discount)}`} accent />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={formatCurrency(cartSummary.total)} strong />
            </View>
            <AnimatedPressable style={styles.primary} onPress={handleContinue}>
              <Text style={styles.primaryText}>Pilih Alamat Pengiriman</Text>
              <Feather name="arrow-right" size={17} color={colors.white} />
            </AnimatedPressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CartItem({ item, onDecrease, onIncrease, onRemove }) {
  const custom = item.customization ?? {};
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.product.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <AnimatedPressable style={styles.remove} onPress={onRemove}><Feather name="trash-2" size={14} color={colors.error} /></AnimatedPressable>
        </View>
        <Text style={styles.tailor}>oleh {item.product.tailor}</Text>
        <View style={styles.chips}>
          <Text style={styles.chip}>{custom.color?.label ?? 'Warna asli'}</Text>
          <Text style={styles.chip}>{custom.sizeType === 'custom' ? 'Custom size' : custom.size}</Text>
          <Text style={styles.chip}>{custom.fabric?.label ?? item.product.material}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(item.unitPrice * item.quantity)}</Text>
          <View style={styles.quantity}>
            <AnimatedPressable style={styles.quantityButton} onPress={onDecrease}><Feather name="minus" size={12} color={colors.forest} /></AnimatedPressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <AnimatedPressable style={styles.quantityButton} onPress={onIncrease}><Feather name="plus" size={12} color={colors.forest} /></AnimatedPressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, accent, strong }) {
  return <View style={styles.row}><Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.rowValue, accent && styles.accent, strong && styles.strongValue]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40, maxWidth: 800, width: '100%', alignSelf: 'center' },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 4, backgroundColor: colors.white, borderWidth: 1, borderColor: '#ECECEC', marginBottom: 10, ...shadows.sm },
  image: { width: 80, height: 95, borderRadius: 4, backgroundColor: colors.sand },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', gap: 8 },
  name: { flex: 1, color: '#222222', fontSize: 13, fontWeight: '700', lineHeight: 17 },
  remove: { width: 28, height: 28, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
  tailor: { color: '#757575', fontSize: 10, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip: { color: '#EE4D2D', fontSize: 8, fontWeight: '700', borderRadius: 2, paddingHorizontal: 5, paddingVertical: 2, backgroundColor: '#FFF0ED', borderWidth: 0.5, borderColor: '#FFCCBA' },
  price: { color: '#EE4D2D', fontSize: 14, fontWeight: '900', marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 3, paddingHorizontal: 2 },
  quantityButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  quantityText: { minWidth: 20, color: '#222222', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  summary: { padding: 14, borderRadius: 4, backgroundColor: colors.white, borderWidth: 1, borderColor: '#ECECEC', marginTop: 8 },
  summaryTitle: { color: '#222222', fontSize: 13.5, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { color: '#757575', fontSize: 11.5 },
  rowValue: { color: '#222222', fontSize: 11.5, fontWeight: '700' },
  accent: { color: '#10B981' },
  divider: { height: 1, backgroundColor: '#ECECEC', marginBottom: 10 },
  strong: { color: '#222222', fontWeight: '800' },
  strongValue: { color: '#EE4D2D', fontSize: 16, fontWeight: '900' },
  primary: { width: '100%', minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 4, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#EE4D2D', marginTop: 12, ...shadows.sm },
  primaryText: { color: colors.white, fontSize: 13.5, fontWeight: '800', textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0ED' },
  emptyTitle: { color: '#222222', fontSize: 16, fontWeight: '800', marginTop: 16 },
  emptyText: { maxWidth: 260, color: '#757575', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
});
