/**
 * @file TailorPortalScreen.js
 * @description Portal / Mode Mitra Penjahit UMKM (Tailor Hub) untuk FashionKu.
 *
 * Fitur:
 * 1. Profil & Usaha Penjahit: Info workshop, portofolio, spesialisasi, ganti bengkel.
 * 2. Chat Langsung dengan Pembeli: Balas pesan, kirim foto kain deadstock.
 * 3. Manajemen Pesanan: Update bertahap (Diterima -> Pola & Jahit -> Selesai -> Diserahkan ke Kurir + input No. Resi & Foto Struk).
 * 4. Manajemen Bahan Eco Swap: Melihat & mengklaim kain hasil swap customer untuk upcycle.
 * 5. Manajemen Produk & Deadstock: Upload produk kreasi & input stok sisa kain di bengkel.
 * 6. Pencairan Dana Semi-Manual (Withdraw): Saldo Rekber cair -> Ajukan tarik dana (BCA, BRI, Mandiri, DANA, GoPay, OVO).
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import LeafMark from '../components/LeafMark';
import { formatCurrency, tailors } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, radius, shadows } from '../theme/colors';

const TAILOR_TABS = [
  { id: 'orders', label: 'Pesanan Masuk', icon: 'package' },
  { id: 'swap', label: 'Bahan Eco Swap', icon: 'recycle' },
  { id: 'inventory', label: 'Katalog & Kain', icon: 'scissors' },
  { id: 'finance', label: 'Keuangan & Payout', icon: 'credit-card' },
  { id: 'profile', label: 'Profil Atelier', icon: 'home' },
];

const BANKS = ['BCA', 'BRI', 'Mandiri', 'DANA', 'GoPay', 'OVO'];

export default function TailorPortalScreen({ onBack, onNavigate }) {
  const insets = useSafeAreaInsets();
  const {
    orders,
    tailors: appTailors,
    tailorBalances,
    tailorWithdrawals,
    ecoSwapSubmissions,
    tailorDeadstocks,
    requestTailorWithdrawal,
    updateOrderStatus,
    claimEcoSwapMaterial,
    addTailorDeadstock,
    addTailorProduct,
    setNotice,
  } = useAppState();

  // Active Tailor Atelier selection (default to Rahayu Tailor)
  const [selectedTailorName, setSelectedTailorName] = useState('Rahayu Tailor');
  const [activeTab, setActiveTab] = useState('orders');

  // Shipment Modal State
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [courierName, setCourierName] = useState('J&T Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80');

  // Withdrawal Modal State
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('BCA');
  const [withdrawAccount, setWithdrawAccount] = useState('8830192841');
  const [withdrawHolder, setWithdrawHolder] = useState('Sri Rahayu');

  // Add Deadstock Modal State
  const [deadstockModalVisible, setDeadstockModalVisible] = useState(false);
  const [deadstockFabric, setDeadstockFabric] = useState('');
  const [deadstockColor, setDeadstockColor] = useState('');
  const [deadstockLength, setDeadstockLength] = useState('');

  // Add Product Modal State
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Outer');
  const [newProductMaterial, setNewProductMaterial] = useState('');

  const activeTailor = useMemo(() => {
    return appTailors.find((t) => t.name === selectedTailorName) || tailors[0];
  }, [appTailors, selectedTailorName]);

  const activeBalance = tailorBalances[selectedTailorName] || {
    available: 780000,
    pendingEscrow: 344000,
    totalEarned: 2450000,
  };

  const tailorOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.tailor && o.tailor.toLowerCase().includes(selectedTailorName.toLowerCase())) ||
        (o.tailorProfile && o.tailorProfile.name === selectedTailorName)
    );
  }, [orders, selectedTailorName]);

  const tailorWithdrawalList = useMemo(() => {
    return tailorWithdrawals.filter((w) => w.tailorName === selectedTailorName);
  }, [tailorWithdrawals, selectedTailorName]);

  const tailorDeadstockList = useMemo(() => {
    return tailorDeadstocks.filter((d) => d.tailor === selectedTailorName);
  }, [tailorDeadstocks, selectedTailorName]);

  // Handle Dispatch Ship
  const handleOpenShipModal = (order) => {
    setShippingOrder(order);
    setTrackingNumber(`JP${Math.floor(100000000 + Math.random() * 900000000)}`);
    setShippingModalVisible(true);
  };

  const handleConfirmShip = async () => {
    if (!shippingOrder || !trackingNumber.trim()) {
      Alert.alert('Lengkapi Data', 'Nomor resi pengiriman wajib diisi.');
      return;
    }
    await updateOrderStatus(shippingOrder.id, 'SHIPPED', 'tailor', {
      courier: courierName,
      trackingCode: trackingNumber.trim(),
      receiptPhoto,
      note: `Paket diserahkan ke ${courierName} dengan no. resi ${trackingNumber.trim()}`,
    });
    setShippingModalVisible(false);
    setShippingOrder(null);
    setNotice(`Pesanan ${shippingOrder.id} resmi dikirim via ${courierName}!`);
  };

  // Handle Withdraw Submit
  const handleConfirmWithdraw = () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (!amount || amount < 50000) {
      Alert.alert('Nominal Tidak Valid', 'Minimal penarikan dana adalah Rp50.000.');
      return;
    }
    if (amount > activeBalance.available) {
      Alert.alert('Saldo Tidak Cukup', 'Nominal melebihi saldo yang siap ditarik.');
      return;
    }
    const success = requestTailorWithdrawal({
      tailorName: selectedTailorName,
      amount,
      bank: withdrawBank,
      accountNumber: withdrawAccount,
      accountHolder: withdrawHolder,
    });
    if (success) {
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
    }
  };

  // Handle Add Deadstock
  const handleSaveDeadstock = () => {
    if (!deadstockFabric || !deadstockColor || !deadstockLength) {
      Alert.alert('Lengkapi Data', 'Mohon isi jenis kain, warna, dan estimasi panjang sisa.');
      return;
    }
    addTailorDeadstock({
      tailor: selectedTailorName,
      fabric: deadstockFabric,
      color: deadstockColor,
      length: `${deadstockLength} meter`,
      image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80',
    });
    setDeadstockModalVisible(false);
    setDeadstockFabric('');
    setDeadstockColor('');
    setDeadstockLength('');
  };

  // Handle Add Upcycle Product
  const handleSaveProduct = () => {
    const priceNum = parseInt(newProductPrice.replace(/\D/g, ''), 10);
    if (!newProductName || !priceNum || !newProductMaterial) {
      Alert.alert('Lengkapi Data', 'Nama busana, harga, dan jenis bahan sisa wajib diisi.');
      return;
    }
    addTailorProduct({
      name: newProductName,
      tailor: selectedTailorName,
      tailorCity: activeTailor.city || 'Yogyakarta',
      price: priceNum,
      category: newProductCategory,
      material: newProductMaterial,
      savedFabric: '0.9m',
      eta: '5-7 hari',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
      description: `Busana kustom upcycle karya atelier ${selectedTailorName} dari kain sisa berkualitas.`,
    });
    setProductModalVisible(false);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductMaterial('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <LeafMark size={16} color="#A3E635" />
            <Text style={styles.headerTitle}>Tailor Hub UMKM</Text>
          </View>
          <Text style={styles.headerSub}>Portal Mitra Kerja Penjahit Lokal</Text>
        </View>
        <TouchableOpacity
          style={styles.switchAtelierBtn}
          onPress={() => {
            const nextIdx = (tailors.findIndex((t) => t.name === selectedTailorName) + 1) % tailors.length;
            setSelectedTailorName(tailors[nextIdx].name);
            setNotice(`Beralih ke bengkel: ${tailors[nextIdx].name}`);
          }}
        >
          <Feather name="repeat" size={12} color="#FFFFFF" />
          <Text style={styles.switchAtelierText}>Ganti</Text>
        </TouchableOpacity>
      </View>

      {/* ── Active Workshop Banner ── */}
      <View style={styles.workshopBanner}>
        <Image
          source={{ uri: activeTailor.image || 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=400&q=80' }}
          style={styles.workshopAvatar}
        />
        <View style={styles.workshopInfo}>
          <View style={styles.workshopTagRow}>
            <Text style={styles.workshopName}>{selectedTailorName}</Text>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Terverifikasi</Text>
            </View>
          </View>
          <Text style={styles.workshopMeta}>
            📍 {activeTailor.city} · Spesialis: {activeTailor.specialty || 'Bespoke MTO'}
          </Text>
        </View>
      </View>

      {/* ── Tabs Bar ── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TAILOR_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Feather name={tab.icon} size={13} color={active ? colors.forest : colors.warmGray} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Tab Contents ── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: PESANAN MASUK */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Manajemen Pengerjaan Pesanan</Text>
              <Text style={styles.sectionCount}>{tailorOrders.length} Pesanan</Text>
            </View>

            {tailorOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="inbox" size={36} color={colors.warmGrayLight} />
                <Text style={styles.emptyTitle}>Belum Ada Pesanan Masuk</Text>
                <Text style={styles.emptyDesc}>Pesanan dari pembeli akan muncul di sini secara otomatis.</Text>
              </View>
            ) : (
              tailorOrders.map((order) => {
                const canMakePattern = order.status === 'PAYMENT_CONFIRMED';
                const canFinishSewing = order.status === 'IN_PRODUCTION';
                const canDispatch = order.status === 'QUALITY_CHECK';
                const isShipped = ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status);

                return (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderTopRow}>
                      <View>
                        <Text style={styles.orderId}>{order.id}</Text>
                        <Text style={styles.orderProduct}>{order.product}</Text>
                      </View>
                      <View style={[styles.statusBadge, isShipped && styles.statusBadgeGreen]}>
                        <Text style={[styles.statusBadgeText, isShipped && styles.statusBadgeTextGreen]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDetailRow}>
                      <Image source={{ uri: order.image }} style={styles.orderThumb} />
                      <View style={styles.orderTextGroup}>
                        <Text style={styles.orderDetailText}>Nilai Pesanan: <Text style={styles.boldText}>{order.price}</Text></Text>
                        <Text style={styles.orderDetailText}>Kain dihemat: {order.savedFabric || '0.8m'}</Text>
                        <Text style={styles.orderDetailText}>Bahan: {order.material || 'Rayon/Linen'}</Text>
                        {!!order.trackingCode && (
                          <Text style={styles.trackingText}>Resi: {order.courier} · {order.trackingCode}</Text>
                        )}
                      </View>
                    </View>

                    {/* Step Controls for Tailor */}
                    <View style={styles.actionRow}>
                      {canMakePattern && (
                        <TouchableOpacity
                          style={styles.actionBtnPrimary}
                          onPress={() => updateOrderStatus(order.id, 'IN_PRODUCTION', 'tailor')}
                        >
                          <Feather name="scissors" size={13} color="#FFFFFF" />
                          <Text style={styles.actionBtnPrimaryText}>Mulai Buat Pola & Jahit</Text>
                        </TouchableOpacity>
                      )}

                      {canFinishSewing && (
                        <TouchableOpacity
                          style={styles.actionBtnPrimary}
                          onPress={() => updateOrderStatus(order.id, 'QUALITY_CHECK', 'tailor')}
                        >
                          <Feather name="check-circle" size={13} color="#FFFFFF" />
                          <Text style={styles.actionBtnPrimaryText}>Selesai Jahit & QC</Text>
                        </TouchableOpacity>
                      )}

                      {canDispatch && (
                        <TouchableOpacity
                          style={styles.actionBtnShip}
                          onPress={() => handleOpenShipModal(order)}
                        >
                          <Feather name="truck" size={13} color="#FFFFFF" />
                          <Text style={styles.actionBtnPrimaryText}>Input Resi & Serahkan ke Kurir</Text>
                        </TouchableOpacity>
                      )}

                      {isShipped && (
                        <View style={styles.shippedInfoPill}>
                          <Feather name="check" size={12} color={colors.forest} />
                          <Text style={styles.shippedInfoText}>Barang Dalam Pengiriman</Text>
                        </View>
                      )}

                      {/* Chat with buyer button */}
                      <TouchableOpacity
                        style={styles.actionBtnSecondary}
                        onPress={() => onNavigate('tailor-chat', { tailorName: selectedTailorName, order })}
                      >
                        <Feather name="message-circle" size={13} color={colors.forest} />
                        <Text style={styles.actionBtnSecondaryText}>Chat Pembeli</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: BAHAN ECO SWAP */}
        {activeTab === 'swap' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kain & Pakaian Hasil Eco Swap</Text>
              <Text style={styles.sectionCount}>Siap Diklaim untuk Upcycle</Text>
            </View>

            <Text style={styles.hintText}>
              Penjahit UMKM dapat mengklaim bahan kain dari customer untuk dibuat menjadi koleksi produk upcycle baru.
            </Text>

            {ecoSwapSubmissions.map((item) => {
              const isClaimedByMe = item.claimedBy === selectedTailorName;
              const isAvailable = !item.claimedBy && item.status === 'APPROVED';

              return (
                <View key={item.id} style={styles.swapCard}>
                  <View style={styles.swapRow}>
                    <Image source={{ uri: item.itemPhoto }} style={styles.swapThumb} />
                    <View style={styles.swapInfo}>
                      <View style={styles.swapTitleRow}>
                        <Text style={styles.swapType}>{item.itemTypeLabel}</Text>
                        <View style={styles.conditionChip}>
                          <Text style={styles.conditionText}>{item.condition}</Text>
                        </View>
                      </View>
                      <Text style={styles.swapMeta}>Jumlah: {item.quantity} {item.itemTypeId === 'kain_sisa' ? 'meter' : 'pcs'}</Text>
                      <Text style={styles.swapMeta}>Oleh: {item.customerName}</Text>
                      <Text style={styles.swapNotes}>Catatan: "{item.notes || 'Kondisi terawat'}"</Text>
                      {!!item.trackingNumber && (
                        <Text style={styles.swapTracking}>Dikirim via {item.courierName} ({item.trackingNumber})</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.swapBottomRow}>
                    {isClaimedByMe ? (
                      <View style={styles.claimedBadge}>
                        <Feather name="check" size={13} color={colors.forest} />
                        <Text style={styles.claimedText}>Telah Diklaim Atelier Ini</Text>
                      </View>
                    ) : isAvailable ? (
                      <TouchableOpacity
                        style={styles.claimBtn}
                        onPress={() => claimEcoSwapMaterial(item.id, selectedTailorName)}
                      >
                        <MaterialCommunityIcons name="hand-heart" size={14} color="#FFFFFF" />
                        <Text style={styles.claimBtnText}>Klaim Bahan untuk Upcycle</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Feather name="clock" size={12} color={colors.warmGray} />
                        <Text style={styles.pendingText}>
                          {item.claimedBy ? `Diklaim ${item.claimedBy}` : 'Menunggu Verifikasi Admin'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: KATALOG & SISA KAIN */}
        {activeTab === 'inventory' && (
          <View>
            {/* Deadstock section */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Stok Kain Sisa (Deadstock) di Workshop</Text>
                <Text style={styles.sectionSub}>Bahan sisa yang siap dipakai untuk pesanan custom</Text>
              </View>
              <TouchableOpacity
                style={styles.addMiniBtn}
                onPress={() => setDeadstockModalVisible(true)}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addMiniBtnText}>Input Kain</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.deadstockGrid}>
              {tailorDeadstockList.map((ds) => (
                <View key={ds.id} style={styles.deadstockCard}>
                  <Image source={{ uri: ds.image }} style={styles.deadstockImg} />
                  <View style={styles.deadstockBody}>
                    <Text style={styles.deadstockFabric}>{ds.fabric}</Text>
                    <Text style={styles.deadstockColor}>Warna: {ds.color}</Text>
                    <View style={styles.deadstockLengthTag}>
                      <Text style={styles.deadstockLengthText}>Tersedia: {ds.length}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Upload Product section */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <View>
                <Text style={styles.sectionTitle}>Katalog Circular Market Sendiri</Text>
                <Text style={styles.sectionSub}>Pakaian upcycle yang dijual langsung ke pengguna</Text>
              </View>
              <TouchableOpacity
                style={styles.addMiniBtn}
                onPress={() => setProductModalVisible(true)}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addMiniBtnText}>Upload Baju</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Feather name="info" size={15} color={colors.forest} />
              <Text style={styles.infoBoxText}>
                Setiap karya baru yang diupload akan dikurasi oleh tim Admin sebelum tampil di etalase FashionKu.
              </Text>
            </View>
          </View>
        )}

        {/* TAB 4: KEUANGAN & PAYOUT (ESCROW) */}
        {activeTab === 'finance' && (
          <View>
            <View style={styles.financeHero}>
              <View style={styles.financeCol}>
                <Text style={styles.financeLabel}>Saldo Siap Ditarik</Text>
                <Text style={styles.financeValue}>{formatCurrency(activeBalance.available)}</Text>
                <Text style={styles.financeSub}>Dana dari pesanan yang telah dikonfirmasi selesai oleh pembeli</Text>
              </View>

              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => setWithdrawModalVisible(true)}
              >
                <Feather name="arrow-up-right" size={16} color="#FFFFFF" />
                <Text style={styles.withdrawBtnText}>Ajukan Penarikan Dana</Text>
              </TouchableOpacity>
            </View>

            {/* Rekber / Escrow Summary */}
            <View style={styles.escrowCardsRow}>
              <View style={styles.escrowCard}>
                <Feather name="lock" size={16} color={colors.warning} />
                <Text style={styles.escrowCardLabel}>Tertahan di Rekber</Text>
                <Text style={styles.escrowCardValue}>{formatCurrency(activeBalance.pendingEscrow)}</Text>
                <Text style={styles.escrowCardDesc}>Cair setelah pembeli klik "Pesanan Diterima"</Text>
              </View>

              <View style={styles.escrowCard}>
                <Feather name="award" size={16} color={colors.forest} />
                <Text style={styles.escrowCardLabel}>Total Pendapatan</Text>
                <Text style={styles.escrowCardValue}>{formatCurrency(activeBalance.totalEarned)}</Text>
                <Text style={styles.escrowCardDesc}>Akumulasi pengerjaan bespoke & upcycling</Text>
              </View>
            </View>

            {/* Withdrawal Queue / History */}
            <Text style={[styles.sectionTitle, { marginTop: 22, marginBottom: 10 }]}>
              Riwayat & Antrean Penarikan Dana
            </Text>

            {tailorWithdrawalList.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada riwayat penarikan dana.</Text>
            ) : (
              tailorWithdrawalList.map((w) => (
                <View key={w.id} style={styles.withdrawCard}>
                  <View style={styles.withdrawTopRow}>
                    <View>
                      <Text style={styles.withdrawId}>{w.id} · {w.bank}</Text>
                      <Text style={styles.withdrawAccount}>{w.accountNumber} a/n {w.accountHolder}</Text>
                      <Text style={styles.withdrawDate}>{w.requestedAt}</Text>
                    </View>
                    <View style={styles.withdrawRight}>
                      <Text style={styles.withdrawAmount}>{formatCurrency(w.amount)}</Text>
                      <View style={[styles.withdrawBadge, w.status === 'TRANSFERRED' && styles.withdrawBadgeDone]}>
                        <Text style={[styles.withdrawBadgeText, w.status === 'TRANSFERRED' && styles.withdrawBadgeTextDone]}>
                          {w.status === 'TRANSFERRED' ? 'SUDAH DITRANSFER' : 'MENUNGGU ADMIN'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {w.proofPhoto && (
                    <View style={styles.proofRow}>
                      <Feather name="image" size={12} color={colors.forest} />
                      <Text style={styles.proofText}>Bukti transfer terlampir oleh Admin CMS</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 5: PROFIL ATELIER */}
        {activeTab === 'profile' && (
          <View>
            <View style={styles.profileCard}>
              <Text style={styles.profileCardTitle}>Informasi Bengkel Jahit UMKM</Text>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Nama Bengkel:</Text>
                <Text style={styles.profileInfoVal}>{selectedTailorName}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Lokasi Workshop:</Text>
                <Text style={styles.profileInfoVal}>{activeTailor.city}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Spesialisasi:</Text>
                <Text style={styles.profileInfoVal}>{activeTailor.specialty || 'Made-to-Order Busana Lokal'}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Rating Pelanggan:</Text>
                <Text style={styles.profileInfoVal}>⭐ {activeTailor.rating} / 5.0</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Respon Chat:</Text>
                <Text style={styles.profileInfoVal}>{activeTailor.responseTime || '< 15 menit'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.chatClientBtn}
              onPress={() => onNavigate('tailor-chat', { tailorName: selectedTailorName })}
            >
              <Feather name="message-square" size={16} color="#FFFFFF" />
              <Text style={styles.chatClientBtnText}>Buka Chat Pelanggan Masuk</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── MODAL 1: INPUT RESI & SERAHKAN KE KURIR ── */}
      <Modal visible={shippingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kirim Paket Pesanan</Text>
              <TouchableOpacity onPress={() => setShippingModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Pesanan #{shippingOrder?.id} — Masukkan nomor resi dan foto struk pengiriman fisik.
            </Text>

            <Text style={styles.inputLabel}>Nama Kurir / Ekspedisi</Text>
            <View style={styles.courierRow}>
              {['J&T Express', 'JNE REG', 'SiCepat', 'Anteraja', 'GoSend'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.courierChip, courierName === c && styles.courierChipActive]}
                  onPress={() => setCourierName(c)}
                >
                  <Text style={[styles.courierChipText, courierName === c && styles.courierChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nomor Resi Pengiriman</Text>
            <TextInput
              style={styles.modalInput}
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholder="Contoh: JP829103810"
            />

            <Text style={styles.inputLabel}>Foto Struk / Bukti Resi Fisik</Text>
            <View style={styles.receiptPreviewWrap}>
              <Image source={{ uri: receiptPhoto }} style={styles.receiptPreviewImg} />
              <View style={styles.receiptOverlayPill}>
                <Feather name="check" size={11} color="#FFFFFF" />
                <Text style={styles.receiptOverlayText}>Struk Terlampir</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleConfirmShip}>
              <Text style={styles.modalSubmitText}>Konfirmasi Kirim Pesanan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: AJUKAN PENARIKAN DANA (WITHDRAW) ── */}
      <Modal visible={withdrawModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajukan Penarikan Dana</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Saldo Siap Ditarik: <Text style={styles.boldText}>{formatCurrency(activeBalance.available)}</Text>
            </Text>

            <Text style={styles.inputLabel}>Pilih Bank / E-Wallet</Text>
            <View style={styles.courierRow}>
              {BANKS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.courierChip, withdrawBank === b && styles.courierChipActive]}
                  onPress={() => setWithdrawBank(b)}
                >
                  <Text style={[styles.courierChipText, withdrawBank === b && styles.courierChipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nominal Penarikan (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="Contoh: 500.000"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Nomor Rekening / No. HP E-Wallet</Text>
            <TextInput
              style={styles.modalInput}
              value={withdrawAccount}
              onChangeText={setWithdrawAccount}
              placeholder="Nomor rekening"
            />

            <Text style={styles.inputLabel}>Nama Pemilik Rekening</Text>
            <TextInput
              style={styles.modalInput}
              value={withdrawHolder}
              onChangeText={setWithdrawHolder}
              placeholder="Nama sesuai buku tabungan"
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleConfirmWithdraw}>
              <Text style={styles.modalSubmitText}>Kirim Pengajuan ke Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: INPUT DEADSTOCK KAIN ── */}
      <Modal visible={deadstockModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Input Stok Kain Sisa</Text>
              <TouchableOpacity onPress={() => setDeadstockModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Jenis Kain</Text>
            <TextInput
              style={styles.modalInput}
              value={deadstockFabric}
              onChangeText={setDeadstockFabric}
              placeholder="Contoh: Katun Poplin Deadstock"
            />

            <Text style={styles.inputLabel}>Warna Kain</Text>
            <TextInput
              style={styles.modalInput}
              value={deadstockColor}
              onChangeText={setDeadstockColor}
              placeholder="Contoh: Sage Green / Terracotta"
            />

            <Text style={styles.inputLabel}>Estimasi Panjang Sisa (Meter)</Text>
            <TextInput
              style={styles.modalInput}
              value={deadstockLength}
              onChangeText={setDeadstockLength}
              placeholder="Contoh: 6.5"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveDeadstock}>
              <Text style={styles.modalSubmitText}>Simpan ke Stok Bengkel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: UPLOAD PRODUK UPCYCLE ── */}
      <Modal visible={productModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Produk Upcycle</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nama Pakaian Upcycle</Text>
            <TextInput
              style={styles.modalInput}
              value={newProductName}
              onChangeText={setNewProductName}
              placeholder="Contoh: Vintage Linen Smock Top"
            />

            <Text style={styles.inputLabel}>Harga Jual (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              value={newProductPrice}
              onChangeText={setNewProductPrice}
              placeholder="Contoh: 165000"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Asal Bahan Sisa</Text>
            <TextInput
              style={styles.modalInput}
              value={newProductMaterial}
              onChangeText={setNewProductMaterial}
              placeholder="Contoh: Sisa linen atelier & perca tenun"
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveProduct}>
              <Text style={styles.modalSubmitText}>Ajukan Produk ke Kurasi Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.forest,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#DDEB9D',
    fontSize: 11,
    marginTop: 1,
  },
  switchAtelierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  switchAtelierText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  workshopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  workshopAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sand,
  },
  workshopInfo: {
    flex: 1,
  },
  workshopTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workshopName: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.forest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  workshopMeta: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: colors.forest,
  },
  tabLabel: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.forest,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionSub: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  sectionCount: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  orderProduct: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextGreen: {
    color: '#15803D',
  },
  orderDetailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  orderThumb: {
    width: 60,
    height: 70,
    borderRadius: 6,
    backgroundColor: colors.sand,
  },
  orderTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  orderDetailText: {
    color: colors.warmGray,
    fontSize: 11,
    marginBottom: 2,
  },
  boldText: {
    color: colors.charcoal,
    fontWeight: '800',
  },
  trackingText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnShip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.forest,
  },
  actionBtnSecondaryText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  shippedInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  shippedInfoText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  hintText: {
    color: colors.warmGray,
    fontSize: 12,
    marginBottom: 12,
  },
  swapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  swapRow: {
    flexDirection: 'row',
    gap: 12,
  },
  swapThumb: {
    width: 64,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.sand,
  },
  swapInfo: {
    flex: 1,
  },
  swapTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swapType: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  conditionChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  swapMeta: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  swapNotes: {
    color: colors.charcoal,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 3,
  },
  swapTracking: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  swapBottomRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  claimedText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingText: {
    color: colors.warmGray,
    fontSize: 11,
  },
  deadstockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  deadstockCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deadstockImg: {
    width: '100%',
    height: 90,
    backgroundColor: colors.sand,
  },
  deadstockBody: {
    padding: 10,
  },
  deadstockFabric: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
  },
  deadstockColor: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 2,
  },
  deadstockLengthTag: {
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  deadstockLengthText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '800',
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addMiniBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDF7EE',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  infoBoxText: {
    flex: 1,
    color: colors.forest,
    fontSize: 11,
    lineHeight: 16,
  },
  financeHero: {
    backgroundColor: colors.forest,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    ...shadows.md,
  },
  financeCol: {
    marginBottom: 12,
  },
  financeLabel: {
    color: '#DDEB9D',
    fontSize: 12,
    fontWeight: '700',
  },
  financeValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  financeSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 4,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 10,
  },
  withdrawBtnText: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900',
  },
  escrowCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  escrowCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  escrowCardLabel: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 6,
  },
  escrowCardValue: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  escrowCardDesc: {
    color: colors.warmGrayLight,
    fontSize: 9,
    marginTop: 4,
  },
  emptyText: {
    color: colors.warmGray,
    fontSize: 12,
    fontStyle: 'italic',
  },
  withdrawCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  withdrawTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  withdrawId: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
  },
  withdrawAccount: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  withdrawDate: {
    color: colors.warmGrayLight,
    fontSize: 10,
    marginTop: 2,
  },
  withdrawRight: {
    alignItems: 'flex-end',
  },
  withdrawAmount: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  withdrawBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  withdrawBadgeDone: {
    backgroundColor: '#DCFCE7',
  },
  withdrawBadgeText: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '800',
  },
  withdrawBadgeTextDone: {
    color: '#15803D',
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  proofText: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  profileCardTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  profileInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileInfoLabel: {
    color: colors.warmGray,
    fontSize: 12,
  },
  profileInfoVal: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
  },
  chatClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: 12,
  },
  chatClientBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
  },
  modalDesc: {
    color: colors.warmGray,
    fontSize: 12,
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.charcoal,
  },
  courierRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  courierChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  courierChipActive: {
    backgroundColor: colors.forest,
  },
  courierChipText: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '700',
  },
  courierChipTextActive: {
    color: '#FFFFFF',
  },
  receiptPreviewWrap: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  receiptPreviewImg: {
    width: '100%',
    height: '100%',
  },
  receiptOverlayPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(44,104,66,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  receiptOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
