/**
 * @file AdminCmsScreen.js
 * @description Dashboard Admin / Superadmin (CMS Web) untuk FashionKu.
 *
 * Fitur:
 * 1. Verifikasi Eco Swap & Approval Poin: 1 tombol "Setujui & Tambah Poin" setelah cek foto kain & resi.
 * 2. Pencairan Dana Penjahit (Manual Transfer): Review penarikan, transfer manual, 1 tombol "Tandai Sudah Ditransfer".
 * 3. Manajemen Circular Market: Kurasi & approve produk baru penjahit sebelum tampil di aplikasi.
 * 4. Manajemen Pengguna & Mitra: Verifikasi mitra penjahit baru & kelola akun.
 * 5. Monitoring Transaksi & Resi: Pantau pesanan aktif & foto struk resi ekspedisi.
 * 6. Manajemen Voucher Sirkular: Buat kode voucher baru (diskon, potongan nominal, kuota).
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

import LeafMark from '../components/LeafMark';
import { formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, radius, shadows } from '../theme/colors';

const ADMIN_TABS = [
  { id: 'swap', label: 'Verifikasi Eco Swap', icon: 'recycle' },
  { id: 'payouts', label: 'Tarik Dana Penjahit', icon: 'credit-card' },
  { id: 'curation', label: 'Kurasi Produk', icon: 'shopping-bag' },
  { id: 'orders', label: 'Monitoring Resi', icon: 'truck' },
  { id: 'users', label: 'Pengguna & Mitra', icon: 'users' },
  { id: 'vouchers', label: 'Voucher Promo', icon: 'tag' },
];

export default function AdminCmsScreen({ onBack, onNavigate }) {
  const insets = useSafeAreaInsets();
  const {
    orders,
    products,
    ecoSwapSubmissions,
    tailorWithdrawals,
    adminVouchers,
    managedUsers,
    approveEcoSwapSubmission,
    rejectEcoSwapSubmission,
    approveTailorWithdrawal,
    approveProduct,
    createAdminVoucher,
    toggleUserStatus,
    setNotice,
  } = useAppState();

  const [activeTab, setActiveTab] = useState('swap');

  // Transfer Proof Modal
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [transferProofUrl, setTransferProofUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80'
  );

  // New Voucher Modal
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLabel, setVoucherLabel] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState('');
  const [voucherMinPurchase, setVoucherMinPurchase] = useState('150000');
  const [voucherQuota, setVoucherQuota] = useState('100');

  // Image zoom modal
  const [zoomImage, setZoomImage] = useState(null);

  const pendingSwaps = useMemo(() => {
    return ecoSwapSubmissions.filter((s) => s.status === 'WAITING_VERIFICATION');
  }, [ecoSwapSubmissions]);

  const pendingWithdrawals = useMemo(() => {
    return tailorWithdrawals.filter((w) => w.status === 'PENDING');
  }, [tailorWithdrawals]);

  const pendingProducts = useMemo(() => {
    return products.filter((p) => p.status === 'PENDING_APPROVAL');
  }, [products]);

  // Handle Approve Withdraw
  const handleOpenTransferModal = (w) => {
    setSelectedWithdrawal(w);
    setTransferModalVisible(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedWithdrawal) return;
    approveTailorWithdrawal(selectedWithdrawal.id, transferProofUrl);
    setTransferModalVisible(false);
    setSelectedWithdrawal(null);
  };

  // Handle Create Voucher
  const handleCreateVoucher = () => {
    const discNum = parseInt(voucherDiscount.replace(/\D/g, ''), 10);
    const minNum = parseInt(voucherMinPurchase.replace(/\D/g, ''), 10);
    const quotaNum = parseInt(voucherQuota.replace(/\D/g, ''), 10);
    if (!voucherCode.trim() || !discNum) {
      Alert.alert('Lengkapi Data', 'Kode voucher dan nominal diskon wajib diisi.');
      return;
    }
    createAdminVoucher({
      code: voucherCode.toUpperCase().trim(),
      label: voucherLabel.trim() || `Diskon Rp${discNum.toLocaleString('id-ID')}`,
      discount: discNum,
      type: 'nominal',
      quota: quotaNum || 50,
      minPurchase: minNum || 100000,
    });
    setVoucherModalVisible(false);
    setVoucherCode('');
    setVoucherLabel('');
    setVoucherDiscount('');
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
            <Text style={styles.headerTitle}>Superadmin CMS</Text>
          </View>
          <Text style={styles.headerSub}>Dashboard Operasional & Kurasi FashionKu</Text>
        </View>
        <View style={styles.adminRoleBadge}>
          <Text style={styles.adminRoleText}>SUPERADMIN</Text>
        </View>
      </View>

      {/* ── Tabs Bar ── */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {ADMIN_TABS.map((tab) => {
            const active = activeTab === tab.id;
            let badgeCount = 0;
            if (tab.id === 'swap') badgeCount = pendingSwaps.length;
            if (tab.id === 'payouts') badgeCount = pendingWithdrawals.length;
            if (tab.id === 'curation') badgeCount = pendingProducts.length;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Feather name={tab.icon} size={13} color={active ? colors.forest : colors.warmGray} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                {badgeCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{badgeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Tab Content ── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: VERIFIKASI ECO SWAP */}
        {activeTab === 'swap' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Verifikasi Pakaian & Resi Masuk</Text>
              <Text style={styles.sectionCount}>{pendingSwaps.length} Menunggu Approval</Text>
            </View>

            <Text style={styles.hintText}>
              Periksa foto fisik pakaian dan foto resi ekspedisi yang dikirim customer. Klik "Setujui & Tambah Poin" untuk mencairkan Circular Points ke akun pengguna secara otomatis.
            </Text>

            {ecoSwapSubmissions.map((item) => {
              const isWaiting = item.status === 'WAITING_VERIFICATION';
              const isApproved = item.status === 'APPROVED' || item.status === 'CLAIMED_BY_TAILOR';

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.cardId}>{item.id}</Text>
                      <Text style={styles.cardCustomer}>{item.customerName} ({item.customerEmail})</Text>
                      <Text style={styles.cardDate}>{item.createdAtLabel}</Text>
                    </View>
                    <View style={[styles.statusBadge, isApproved ? styles.badgeGreen : isWaiting ? styles.badgeAmber : styles.badgeRed]}>
                      <Text style={[styles.statusBadgeText, isApproved ? styles.textGreen : isWaiting ? styles.textAmber : styles.textRed]}>
                        {isApproved ? 'DISETUJUI' : isWaiting ? 'PERLU VERIFIKASI' : 'DITOLAK'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.swapDetailsRow}>
                    {/* Item Photo */}
                    <TouchableOpacity onPress={() => setZoomImage(item.itemPhoto)}>
                      <Image source={{ uri: item.itemPhoto }} style={styles.thumbImage} />
                      <Text style={styles.thumbCaption}>Foto Pakaian 🔍</Text>
                    </TouchableOpacity>

                    {/* Receipt Photo */}
                    {item.receiptPhoto ? (
                      <TouchableOpacity onPress={() => setZoomImage(item.receiptPhoto)}>
                        <Image source={{ uri: item.receiptPhoto }} style={styles.thumbImage} />
                        <Text style={styles.thumbCaption}>Foto Resi 🔍</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.thumbImage, styles.noReceipt]}>
                        <Feather name="alert-triangle" size={20} color={colors.warning} />
                        <Text style={styles.noReceiptText}>Belum ada resi</Text>
                      </View>
                    )}

                    {/* Meta info */}
                    <View style={styles.metaCol}>
                      <Text style={styles.metaRow}>Kategori: <Text style={styles.bold}>{item.itemTypeLabel}</Text></Text>
                      <Text style={styles.metaRow}>Jumlah: <Text style={styles.bold}>{item.quantity} {item.itemTypeId === 'kain_sisa' ? 'm' : 'pcs'}</Text></Text>
                      <Text style={styles.metaRow}>Kondisi: <Text style={styles.bold}>{item.condition}</Text></Text>
                      <Text style={styles.metaRow}>Poin: <Text style={[styles.bold, { color: colors.forest }]}>+{item.earnedPoints} Pts</Text></Text>
                      {item.courierName && (
                        <Text style={styles.resiHighlight}>
                          {item.courierName}: {item.trackingNumber}
                        </Text>
                      )}
                    </View>
                  </View>

                  <Text style={styles.notesText}>Catatan Customer: "{item.notes || 'Tidak ada catatan khusus'}"</Text>

                  {/* 1-Click Action for Admin */}
                  {isWaiting && (
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.btnApprove}
                        onPress={() => approveEcoSwapSubmission(item.id)}
                      >
                        <Feather name="check-circle" size={14} color="#FFFFFF" />
                        <Text style={styles.btnApproveText}>Setujui & Tambah Poin (+{item.earnedPoints} Pts)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnReject}
                        onPress={() => rejectEcoSwapSubmission(item.id, 'Resi tidak valid atau tidak terbaca')}
                      >
                        <Feather name="x" size={14} color={colors.error} />
                        <Text style={styles.btnRejectText}>Tolak</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: TARIK DANA PENJAHIT (PAYOUT ESCROW) */}
        {activeTab === 'payouts' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pencairan Dana Penjahit (Manual Transfer)</Text>
              <Text style={styles.sectionCount}>{pendingWithdrawals.length} Permintaan</Text>
            </View>

            <Text style={styles.hintText}>
              Admin melakukan transfer manual via m-Banking/E-Wallet ke rekening penjahit, lalu klik "Tandai Sudah Ditransfer" beserta upload bukti transfer.
            </Text>

            {tailorWithdrawals.map((w) => {
              const isPending = w.status === 'PENDING';
              return (
                <View key={w.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.cardId}>{w.id} · {w.bank}</Text>
                      <Text style={styles.cardCustomer}>Atelier: {w.tailorName}</Text>
                      <Text style={styles.cardDate}>{w.requestedAt}</Text>
                    </View>
                    <View style={styles.payoutRight}>
                      <Text style={styles.payoutAmount}>{formatCurrency(w.amount)}</Text>
                      <View style={[styles.statusBadge, isPending ? styles.badgeAmber : styles.badgeGreen]}>
                        <Text style={[styles.statusBadgeText, isPending ? styles.textAmber : styles.textGreen]}>
                          {isPending ? 'MENUNGGU TRANSFER' : 'SELESAI DITRANSFER'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.bankDetailCard}>
                    <Text style={styles.bankDetailRow}>Bank / E-Wallet: <Text style={styles.bold}>{w.bank}</Text></Text>
                    <Text style={styles.bankDetailRow}>Nomor Rekening: <Text style={[styles.bold, { color: colors.forest }]}>{w.accountNumber}</Text></Text>
                    <Text style={styles.bankDetailRow}>Nama Pemilik: <Text style={styles.bold}>{w.accountHolder}</Text></Text>
                  </View>

                  {isPending ? (
                    <TouchableOpacity
                      style={styles.btnTransfer}
                      onPress={() => handleOpenTransferModal(w)}
                    >
                      <Feather name="send" size={14} color="#FFFFFF" />
                      <Text style={styles.btnTransferText}>Tandai Sudah Ditransfer & Upload Bukti</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.transferDoneBox}>
                      <Feather name="check-circle" size={14} color={colors.forest} />
                      <Text style={styles.transferDoneText}>Ditransfer pada: {w.transferredAt || 'Selesai'}</Text>
                      {w.proofPhoto && (
                        <TouchableOpacity onPress={() => setZoomImage(w.proofPhoto)}>
                          <Text style={styles.viewProofText}>Lihat Bukti 🔍</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: KURASI PRODUK */}
        {activeTab === 'curation' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kurasi Produk Busana Penjahit</Text>
              <Text style={styles.sectionCount}>{pendingProducts.length} Menunggu Review</Text>
            </View>

            <Text style={styles.hintText}>
              Setujui karya busana upcycle yang diupload oleh mitra penjahit agar bisa tampil di katalog publik circular market.
            </Text>

            {products.slice(0, 6).map((p) => {
              const isPending = p.status === 'PENDING_APPROVAL';
              return (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: p.image }} style={styles.productThumb} />
                    <View style={styles.productInfoCol}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productTailor}>Oleh: {p.tailor} ({p.tailorCity})</Text>
                      <Text style={styles.productPrice}>{formatCurrency(p.price)}</Text>
                      <Text style={styles.productMaterial}>Bahan: {p.material}</Text>
                    </View>
                    <View style={[styles.statusBadge, isPending ? styles.badgeAmber : styles.badgeGreen]}>
                      <Text style={[styles.statusBadgeText, isPending ? styles.textAmber : styles.textGreen]}>
                        {isPending ? 'PENDING' : 'AKTIF'}
                      </Text>
                    </View>
                  </View>

                  {isPending && (
                    <TouchableOpacity
                      style={styles.btnApprove}
                      onPress={() => approveProduct(p.id)}
                    >
                      <Feather name="check" size={14} color="#FFFFFF" />
                      <Text style={styles.btnApproveText}>Setujui & Publikasikan ke Katalog</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 4: MONITORING TRANSAKSI & RESI */}
        {activeTab === 'orders' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Monitoring Transaksi & Resi Ekspedisi</Text>
              <Text style={styles.sectionCount}>{orders.length} Total Pesanan</Text>
            </View>

            {orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.cardId}>{o.id}</Text>
                    <Text style={styles.cardCustomer}>{o.product} · oleh {o.tailor}</Text>
                  </View>
                  <Text style={styles.payoutAmount}>{o.price}</Text>
                </View>

                <View style={styles.orderMonitoringRow}>
                  <Text style={styles.monitoringLabel}>Status: <Text style={styles.bold}>{o.status}</Text></Text>
                  <Text style={styles.monitoringLabel}>
                    Resi: <Text style={[styles.bold, { color: colors.forest }]}>{o.courier || 'Kurir'} · {o.trackingCode || '-'}</Text>
                  </Text>
                </View>

                {o.receiptPhoto && (
                  <TouchableOpacity
                    style={styles.viewResiBtn}
                    onPress={() => setZoomImage(o.receiptPhoto)}
                  >
                    <Feather name="image" size={13} color={colors.forest} />
                    <Text style={styles.viewResiText}>Lihat Foto Struk Resi dari Penjahit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* TAB 5: PENGGUNA & MITRA */}
        {activeTab === 'users' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kelola Pengguna & Mitra Penjahit</Text>
              <Text style={styles.sectionCount}>{managedUsers.length} Akun Terdaftar</Text>
            </View>

            {managedUsers.map((u) => {
              const isActive = u.status === 'ACTIVE';
              return (
                <View key={u.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <View style={styles.userRoleRow}>
                        <Text style={styles.userNameText}>{u.name}</Text>
                        <View style={[styles.roleChip, u.role === 'tailor' ? styles.roleTailor : styles.roleCustomer]}>
                          <Text style={styles.roleChipText}>{u.role === 'tailor' ? 'PENJAHIT' : 'CUSTOMER'}</Text>
                        </View>
                      </View>
                      <Text style={styles.userEmailText}>{u.email} · Bergabung: {u.joined}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.userToggleBtn, isActive ? styles.btnDeactivate : styles.btnActivate]}
                      onPress={() => toggleUserStatus(u.id)}
                    >
                      <Text style={[styles.userToggleText, isActive ? styles.textRed : styles.textGreen]}>
                        {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 6: VOUCHER SIRKULAR */}
        {activeTab === 'vouchers' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Manajemen Voucher & Kode Promo</Text>
                <Text style={styles.sectionSub}>Bikin kode diskon untuk menyambut pembeli baru</Text>
              </View>
              <TouchableOpacity
                style={styles.addVoucherBtn}
                onPress={() => setVoucherModalVisible(true)}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addVoucherBtnText}>Bikin Voucher</Text>
              </TouchableOpacity>
            </View>

            {adminVouchers.map((v) => (
              <View key={v.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View>
                    <View style={styles.voucherCodePill}>
                      <Text style={styles.voucherCodeText}>{v.code}</Text>
                    </View>
                    <Text style={styles.voucherLabelText}>{v.label}</Text>
                  </View>
                  <Text style={styles.voucherDiscountText}>{formatCurrency(v.discount)}</Text>
                </View>
                <Text style={styles.voucherMetaText}>
                  Min. Belanja: {formatCurrency(v.minPurchase)} · Kuota: {v.usedCount} / {v.quota} terpakai
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: UPLOAD BUKTI TRANSFER PAYOUT ── */}
      <Modal visible={transferModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tandai Sudah Ditransfer</Text>
              <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Penarikan #{selectedWithdrawal?.id} oleh <Text style={styles.bold}>{selectedWithdrawal?.tailorName}</Text> sebesar <Text style={styles.bold}>{formatCurrency(selectedWithdrawal?.amount)}</Text> ke rekening {selectedWithdrawal?.bank} {selectedWithdrawal?.accountNumber}.
            </Text>

            <Text style={styles.inputLabel}>Bukti Transfer M-Banking / E-Wallet</Text>
            <View style={styles.proofPreviewWrap}>
              <Image source={{ uri: transferProofUrl }} style={styles.proofPreviewImg} />
              <View style={styles.proofOverlayPill}>
                <Feather name="check" size={11} color="#FFFFFF" />
                <Text style={styles.proofOverlayText}>Struk M-Banking Terlampir</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleConfirmTransfer}>
              <Text style={styles.modalSubmitText}>Konfirmasi Pembayaran Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: BIKIN KODE VOUCHER BARU ── */}
      <Modal visible={voucherModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bikin Voucher Diskon Baru</Text>
              <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Kode Promo (Huruf Kapital)</Text>
            <TextInput
              style={styles.modalInput}
              value={voucherCode}
              onChangeText={setVoucherCode}
              placeholder="Contoh: WELCOME30"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Judul Promo</Text>
            <TextInput
              style={styles.modalInput}
              value={voucherLabel}
              onChangeText={setVoucherLabel}
              placeholder="Contoh: Diskon Sambutan Pengguna Baru"
            />

            <Text style={styles.inputLabel}>Nominal Potongan (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              value={voucherDiscount}
              onChangeText={setVoucherDiscount}
              placeholder="Contoh: 30000"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Minimal Belanja (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              value={voucherMinPurchase}
              onChangeText={setVoucherMinPurchase}
              placeholder="Contoh: 150000"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateVoucher}>
              <Text style={styles.modalSubmitText}>Terbitkan Kode Voucher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: ZOOM FOTO ── */}
      <Modal visible={!!zoomImage} transparent animationType="fade">
        <View style={styles.zoomOverlay}>
          <TouchableOpacity style={styles.closeZoomBtn} onPress={() => setZoomImage(null)}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {zoomImage && (
            <Image source={{ uri: zoomImage }} style={styles.zoomImg} resizeMode="contain" />
          )}
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
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  adminRoleBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminRoleText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
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
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
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
    marginBottom: 8,
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
  hintText: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardId: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  cardCustomer: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  cardDate: {
    color: colors.warmGrayLight,
    fontSize: 10,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  textAmber: { color: '#D97706' },
  textGreen: { color: '#15803D' },
  textRed: { color: '#DC2626' },
  swapDetailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  thumbImage: {
    width: 68,
    height: 78,
    borderRadius: 6,
    backgroundColor: colors.sand,
  },
  thumbCaption: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  noReceipt: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  noReceiptText: {
    color: '#D97706',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
  },
  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    color: colors.warmGray,
    fontSize: 11,
    marginBottom: 2,
  },
  bold: {
    color: colors.charcoal,
    fontWeight: '800',
  },
  resiHighlight: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  notesText: {
    color: colors.charcoal,
    fontSize: 11,
    fontStyle: 'italic',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  btnApprove: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnApproveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  btnReject: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnRejectText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  payoutRight: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    color: colors.forest,
    fontSize: 15,
    fontWeight: '900',
  },
  bankDetailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  bankDetailRow: {
    color: colors.warmGray,
    fontSize: 11,
    marginBottom: 3,
  },
  btnTransfer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.forest,
    paddingVertical: 11,
    borderRadius: 8,
  },
  btnTransferText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  transferDoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
  },
  transferDoneText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  viewProofText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  productThumb: {
    width: 60,
    height: 70,
    borderRadius: 6,
    backgroundColor: colors.sand,
  },
  productInfoCol: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  productTailor: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2,
  },
  productPrice: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  productMaterial: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 1,
  },
  orderMonitoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  monitoringLabel: {
    color: colors.warmGray,
    fontSize: 11,
  },
  viewResiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  viewResiText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '800',
  },
  userRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userNameText: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  roleChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTailor: { backgroundColor: '#EDF7EE' },
  roleCustomer: { backgroundColor: '#EFF6FF' },
  roleChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.forest,
  },
  userEmailText: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 3,
  },
  userToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnDeactivate: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  btnActivate: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  userToggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  addVoucherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addVoucherBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  voucherCodePill: {
    backgroundColor: '#EDF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  voucherCodeText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  voucherLabelText: {
    color: colors.charcoal,
    fontSize: 12,
    fontWeight: '700',
  },
  voucherDiscountText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '900',
  },
  voucherMetaText: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
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
    lineHeight: 17,
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
  proofPreviewWrap: {
    position: 'relative',
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  proofPreviewImg: {
    width: '100%',
    height: '100%',
  },
  proofOverlayPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30,41,59,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proofOverlayText: {
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
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeZoomBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  zoomImg: {
    width: '90%',
    height: '70%',
  },
});
