import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  calcExchangePoints,
  donationPartners,
  exchangeItemTypes,
  exchangePointTiers,
  formatCurrency,
  getPointTier,
  pointRedemptionOptions
} from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, radius, shadows } from '../theme/colors';

// ─── Internal Tab IDs ────────────────────────────────────────────────────────
const TABS = [
  { id: 'tukar', label: 'Tukar Barang', icon: 'refresh-cw' },
  { id: 'poin', label: 'Poin Saya', icon: 'star' },
  { id: 'redeem', label: 'Redeem', icon: 'gift' }
];

// ─── Step IDs for Tukar flow ─────────────────────────────────────────────────
const STEP_SELECT = 'select';
const STEP_DETAIL = 'detail';
const STEP_SHIPPING = 'shipping';
const STEP_MODE = 'mode';
const STEP_CONFIRM = 'confirm';
const STEP_SUCCESS = 'success';
const CONDITIONS = ['Bahan Utuh', 'Kancing Lepas', 'Noda', 'Robek'];

// ─── Helper ──────────────────────────────────────────────────────────────────
function PointBadge({ points, small }) {
  const tier = getPointTier(points);
  return (
    <View style={[styles.pointBadge, small && styles.pointBadgeSmall, { backgroundColor: tier.color + '22' }]}>
      <Feather name="star" size={small ? 10 : 12} color={tier.color} />
      <Text style={[styles.pointBadgeText, small && styles.pointBadgeTextSmall, { color: tier.color }]}>
        {points.toLocaleString('id-ID')} pts
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ExchangeScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const { circularPoints, exchangeHistory, submitExchange, redeemPoints, requireAuth } = useAppState();
  const [activeTab, setActiveTab] = useState('tukar');

  // ─── Tukar flow state ─────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_SELECT);
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('Bahan Utuh');
  const [itemPhoto, setItemPhoto] = useState('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80');
  const [courierName, setCourierName] = useState('J&T Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80');
  const [mode, setMode] = useState('points'); // 'points' | 'donate'
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [notes, setNotes] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const tier = useMemo(() => getPointTier(circularPoints), [circularPoints]);
  const nextTier = useMemo(() => {
    const currentIdx = exchangePointTiers.findIndex((t) => t.name === tier.name);
    return exchangePointTiers[currentIdx + 1] ?? null;
  }, [tier]);
  const tierProgress = useMemo(() => {
    if (!nextTier) return 1;
    const range = nextTier.minPoints - tier.minPoints;
    return Math.min((circularPoints - tier.minPoints) / range, 1);
  }, [circularPoints, tier, nextTier]);

  const estimatedPoints = useMemo(() => {
    const qty = parseFloat(quantity);
    if (!selectedType || isNaN(qty)) return 0;
    return calcExchangePoints(selectedType.id, qty);
  }, [selectedType, quantity]);

  // ─── Tukar flow handlers ──────────────────────────────────────────────────
  const handleSelectType = useCallback((type) => {
    setSelectedType(type);
    setQuantity('');
    setCondition('Bahan Utuh');
    setStep(STEP_DETAIL);
  }, []);

  const handleBackStep = useCallback(() => {
    if (step === STEP_DETAIL) { setStep(STEP_SELECT); setSelectedType(null); }
    else if (step === STEP_SHIPPING) setStep(STEP_DETAIL);
    else if (step === STEP_MODE) setStep(STEP_SHIPPING);
    else if (step === STEP_CONFIRM) setStep(STEP_MODE);
  }, [step]);

  const handleSubmit = useCallback(() => {
    requireAuth(async () => {
      const record = await submitExchange({
        itemTypeId: selectedType.id,
        quantity: parseFloat(quantity),
        condition,
        itemPhoto,
        courierName,
        trackingNumber: trackingNumber.trim() || `JP${Math.floor(100000000 + Math.random() * 900000000)}`,
        receiptPhoto,
        mode,
        donationPartnerId: selectedPartner?.id ?? null,
        notes
      });
      setSubmittedRecord(record);
      setStep(STEP_SUCCESS);
    }, 'Silakan masuk ke akun CIRCULAI untuk mengajukan tukar barang.');
  }, [submitExchange, selectedType, quantity, condition, itemPhoto, courierName, trackingNumber, receiptPhoto, mode, selectedPartner, notes, requireAuth]);

  const handleReset = useCallback(() => {
    setStep(STEP_SELECT);
    setSelectedType(null);
    setQuantity('');
    setCondition('Bahan Utuh');
    setCourierName('J&T Express');
    setTrackingNumber('');
    setMode('points');
    setSelectedPartner(null);
    setNotes('');
    setSubmittedRecord(null);
  }, []);

  // ─── Redeem ───────────────────────────────────────────────────────────────
  const handleRedeem = useCallback((option) => {
    requireAuth(() => {
      redeemPoints(option);
    }, 'Silakan masuk ke akun CIRCULAI untuk menukar poin dengan voucher.');
  }, [redeemPoints, requireAuth]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Circular Exchange</Text>
          <Text style={styles.headerSub}>Barang bekas → dampak nyata</Text>
        </View>
        <PointBadge points={circularPoints} small />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => { setActiveTab(tab.id); handleReset(); }}
            >
              <Feather name={tab.icon} size={14} color={active ? colors.forest : colors.warmGray} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {activeTab === 'tukar' && (
        <TukarTab
          step={step}
          selectedType={selectedType}
          quantity={quantity}
          condition={condition}
          itemPhoto={itemPhoto}
          courierName={courierName}
          trackingNumber={trackingNumber}
          receiptPhoto={receiptPhoto}
          mode={mode}
          selectedPartner={selectedPartner}
          notes={notes}
          estimatedPoints={estimatedPoints}
          submittedRecord={submittedRecord}
          onSelectType={handleSelectType}
          onBackStep={handleBackStep}
          onQuantityChange={setQuantity}
          onConditionChange={setCondition}
          onItemPhotoChange={setItemPhoto}
          onCourierNameChange={setCourierName}
          onTrackingNumberChange={setTrackingNumber}
          onReceiptPhotoChange={setReceiptPhoto}
          onModeChange={setMode}
          onPartnerChange={setSelectedPartner}
          onNotesChange={setNotes}
          onNextToShipping={() => setStep(STEP_SHIPPING)}
          onNextToMode={() => setStep(STEP_MODE)}
          onNextToConfirm={() => setStep(STEP_CONFIRM)}
          onSubmit={handleSubmit}
          onReset={handleReset}
          insets={insets}
        />
      )}
      {activeTab === 'poin' && (
        <PoinTab
          circularPoints={circularPoints}
          tier={tier}
          nextTier={nextTier}
          tierProgress={tierProgress}
          exchangeHistory={exchangeHistory}
          insets={insets}
        />
      )}
      {activeTab === 'redeem' && (
        <RedeemTab
          circularPoints={circularPoints}
          onRedeem={handleRedeem}
          insets={insets}
        />
      )}
    </View>
  );
}

// ─── Tab: Tukar Barang ────────────────────────────────────────────────────────
function TukarTab({
  step,
  selectedType,
  quantity,
  condition,
  itemPhoto,
  courierName,
  trackingNumber,
  receiptPhoto,
  mode,
  selectedPartner,
  notes,
  estimatedPoints,
  submittedRecord,
  onSelectType,
  onBackStep,
  onQuantityChange,
  onConditionChange,
  onItemPhotoChange,
  onCourierNameChange,
  onTrackingNumberChange,
  onReceiptPhotoChange,
  onModeChange,
  onPartnerChange,
  onNotesChange,
  onNextToShipping,
  onNextToMode,
  onNextToConfirm,
  onSubmit,
  onReset,
  insets,
}) {
  const qty = parseFloat(quantity);
  const qtyValid = !isNaN(qty) && selectedType && qty >= selectedType.minUnit;

  if (step === STEP_SUCCESS) {
    const isPoints = submittedRecord?.mode === 'points';
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Feather name={isPoints ? 'check' : 'heart'} size={36} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>
            Pengajuan Eco Swap Berhasil!
          </Text>
          <Text style={styles.successDesc}>
            {isPoints
              ? `Pengajuan tukar pakaian berhasil dikirim. Poin sebesar +${submittedRecord?.earnedPoints} Pts akan masuk otomatis setelah Admin / Penjahit memverifikasi resi dan kondisi barang sampai.`
              : 'Pakaian bekasmu akan disalurkan ke mitra sosial CIRCULAI. Terima kasih atas kontribusimu!'}
          </Text>

          {isPoints && (
            <View style={styles.successPointRow}>
              <Feather name="clock" size={16} color="#D97706" />
              <Text style={styles.successPointText}>Status: Menunggu Verifikasi Admin</Text>
            </View>
          )}

          <View style={styles.successSummaryCard}>
            <View style={styles.successRow}>
              <Text style={styles.successInfoLabel}>ID Pengajuan</Text>
              <Text style={styles.successInfoValue}>{submittedRecord?.id}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successInfoLabel}>Kondisi Pakaian</Text>
              <Text style={styles.successInfoValue}>{submittedRecord?.condition}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successInfoLabel}>Ekspedisi & Resi</Text>
              <Text style={styles.successInfoValue}>
                {submittedRecord?.courierName || 'J&T Express'} · {submittedRecord?.trackingNumber || '-'}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successInfoLabel}>Estimasi Poin</Text>
              <Text style={[styles.successInfoValue, { color: colors.forest, fontWeight: '900' }]}>
                +{submittedRecord?.earnedPoints} Poin Sirkular
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={onReset}>
            <Feather name="plus" size={16} color={colors.white} />
            <Text style={styles.btnPrimaryText}>Tukar Barang Lainnya</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
      {/* ── Step Indicator ── */}
      {step !== STEP_SELECT && (
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={onBackStep} hitSlop={8}>
            <Feather name="chevron-left" size={20} color={colors.forest} />
          </TouchableOpacity>
          <View style={styles.stepDots}>
            {[STEP_DETAIL, STEP_SHIPPING, STEP_MODE, STEP_CONFIRM].map((s, i) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  [STEP_DETAIL, STEP_SHIPPING, STEP_MODE, STEP_CONFIRM].indexOf(step) >= i && styles.stepDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* ── STEP 1: Pilih Kategori ── */}
      {step === STEP_SELECT && (
        <>
          <Text style={styles.sectionTitle}>Pilih Jenis Pakaian / Kain</Text>
          <Text style={styles.sectionDesc}>Barang yang kamu kirim akan didaur ulang menjadi koleksi busana upcycle baru.</Text>
          <View style={styles.typeGrid}>
            {exchangeItemTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeCard, { borderColor: type.color + '44' }]}
                onPress={() => onSelectType(type)}
              >
                <View style={[styles.typeIconBox, { backgroundColor: type.color + '18' }]}>
                  <Feather name="package" size={22} color={type.color} />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDesc} numberOfLines={2}>{type.desc}</Text>
                <View style={styles.typePointRow}>
                  <Feather name="star" size={11} color={colors.warning} />
                  <Text style={styles.typePointText}>{type.pointsPerUnit} pts / {type.unit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ── STEP 2: Detail Pakaian, Kondisi & Foto ── */}
      {step === STEP_DETAIL && selectedType && (
        <>
          <View style={[styles.selectedTypeBar, { borderLeftColor: selectedType.color }]}>
            <View style={[styles.typeIconBoxSm, { backgroundColor: selectedType.color + '18' }]}>
              <Feather name="package" size={16} color={selectedType.color} />
            </View>
            <View style={styles.selectedTypeInfo}>
              <Text style={styles.selectedTypeLabel}>{selectedType.label}</Text>
              <Text style={styles.selectedTypeRate}>{selectedType.pointsPerUnit} pts / {selectedType.unit}</Text>
            </View>
          </View>

          {/* Kuantitas Input & Point Calculator */}
          <Text style={styles.fieldLabel}>
            Estimasi {selectedType.unit === 'kg' ? 'Berat' : selectedType.unit === 'meter' ? 'Panjang' : 'Jumlah Pakaian'}
          </Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={styles.qtyInput}
              value={quantity}
              onChangeText={onQuantityChange}
              keyboardType="decimal-pad"
              placeholder={`Contoh: 3 ${selectedType.unit}`}
              placeholderTextColor={colors.warmGrayLight}
            />
            <View style={styles.qtyUnit}>
              <Text style={styles.qtyUnitText}>{selectedType.unit}</Text>
            </View>
          </View>

          {qtyValid && (
            <View style={styles.estimateBox}>
              <Feather name="star" size={16} color={colors.warning} />
              <Text style={styles.estimateText}>
                Kalkulator Poin: <Text style={styles.estimatePoints}>+{estimatedPoints} CircularPoints</Text>
              </Text>
            </View>
          )}

          {/* Pilihan Catatan Kondisi Pakaian */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Catatan Kondisi Pakaian</Text>
          <View style={styles.conditionChipsRow}>
            {CONDITIONS.map((cond) => {
              const active = condition === cond;
              return (
                <TouchableOpacity
                  key={cond}
                  style={[styles.conditionChipItem, active && styles.conditionChipItemActive]}
                  onPress={() => onConditionChange(cond)}
                >
                  <Text style={[styles.conditionChipItemText, active && styles.conditionChipItemTextActive]}>
                    {cond}
                  </Text>
                  {active && <Feather name="check" size={12} color={colors.forest} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Upload Foto Pakaian */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Upload Foto Pakaian / Kain</Text>
          <View style={styles.photoUploadCard}>
            <Image source={{ uri: itemPhoto }} style={styles.photoPreview} />
            <View style={styles.photoActionCol}>
              <Text style={styles.photoHint}>Ambil dari kamera langsung atau pilih foto dari galeri</Text>
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => {
                    onItemPhotoChange('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80');
                    Alert.alert('Foto Terambil', 'Foto pakaian berhasil diambil melalui kamera.');
                  }}
                >
                  <Feather name="camera" size={13} color={colors.forest} />
                  <Text style={styles.photoBtnText}>Kamera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => {
                    onItemPhotoChange('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80');
                    Alert.alert('Foto Terpilih', 'Foto pakaian berhasil dipilih dari galeri.');
                  }}
                >
                  <Feather name="image" size={13} color={colors.forest} />
                  <Text style={styles.photoBtnText}>Galeri</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, !qtyValid && styles.btnDisabled]}
            onPress={onNextToShipping}
            disabled={!qtyValid}
          >
            <Text style={styles.btnPrimaryText}>Lanjut ke Pengiriman</Text>
            <Feather name="arrow-right" size={16} color={colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* ── STEP 3: Alur Pengiriman Simpel & Upload Resi ── */}
      {step === STEP_SHIPPING && (
        <>
          <Text style={styles.sectionTitle}>Alur Pengiriman Simpel</Text>
          <Text style={styles.sectionDesc}>
            Kirim pakaian via ekspedisi pilihanmu sendiri. Setelah paket diserahkan ke kurir, ketik nomor resi dan upload foto struk pengiriman.
          </Text>

          {/* Eco Hub Address Card */}
          <View style={styles.shippingBox}>
            <Feather name="map-pin" size={16} color={colors.forest} />
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingTitle}>Alamat Tujuan Pengiriman:</Text>
              <Text style={styles.shippingAddr}>
                CIRCULAI Eco Hub (Upcycling Workshop){'\n'}
                Jl. Kaliurang KM 7, Sleman, D.I. Yogyakarta 55581{'\n'}
                Penerima: Tim Verifikasi Circulai (0812-3456-7890)
              </Text>
            </View>
          </View>

          {/* Courier Selector */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Pilih Nama Kurir / Ekspedisi</Text>
          <View style={styles.conditionChipsRow}>
            {['J&T Express', 'JNE REG', 'SiCepat', 'Anteraja', 'Pos Indonesia', 'GoSend/Grab'].map((c) => {
              const active = courierName === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.conditionChipItem, active && styles.conditionChipItemActive]}
                  onPress={() => onCourierNameChange(c)}
                >
                  <Text style={[styles.conditionChipItemText, active && styles.conditionChipItemTextActive]}>
                    {c}
                  </Text>
                  {active && <Feather name="check" size={12} color={colors.forest} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tracking Number Input */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Nomor Resi Pengiriman</Text>
          <TextInput
            style={styles.modalInputText}
            value={trackingNumber}
            onChangeText={onTrackingNumberChange}
            placeholder="Contoh: JP829103810 / 002849103851"
            placeholderTextColor={colors.warmGrayLight}
          />

          {/* Receipt Photo Upload */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Upload Foto Struk / Bukti Resi</Text>
          <View style={styles.photoUploadCard}>
            <Image source={{ uri: receiptPhoto }} style={styles.photoPreview} />
            <View style={styles.photoActionCol}>
              <Text style={styles.photoHint}>Foto struk dari kurir untuk verifikasi kelayakan poin</Text>
              <TouchableOpacity
                style={[styles.photoBtn, { marginTop: 6 }]}
                onPress={() => {
                  onReceiptPhotoChange('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80');
                  Alert.alert('Foto Struk Terpilih', 'Foto struk resi berhasil dilampirkan.');
                }}
              >
                <Feather name="camera" size={13} color={colors.forest} />
                <Text style={styles.photoBtnText}>Ambil / Ganti Foto Struk</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={onNextToMode}
          >
            <Text style={styles.btnPrimaryText}>Lanjut</Text>
            <Feather name="arrow-right" size={16} color={colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* ── STEP 4: Pilih Modus (Poin / Donasi) ── */}
      {step === STEP_MODE && (
        <>
          <Text style={styles.sectionTitle}>Pilih Metode Kontribusi</Text>
          <Text style={styles.sectionDesc}>Tentukan bagaimana kamu ingin memanfaatkan pakaian yang kamu tukar.</Text>

          <TouchableOpacity
            style={[styles.modeCard, mode === 'points' && styles.modeCardActive]}
            onPress={() => onModeChange('points')}
          >
            <View style={[styles.modeIconBox, { backgroundColor: colors.warning + '18' }]}>
              <Feather name="star" size={22} color={colors.warning} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Dapatkan CircularPoints (+{estimatedPoints} Pts)</Text>
              <Text style={styles.modeDesc}>Poin bisa langsung dipakai memotong total belanja atau ditukar voucher diskon.</Text>
            </View>
            <View style={[styles.radioOuter, mode === 'points' && styles.radioOuterActive]}>
              {mode === 'points' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, mode === 'donate' && styles.modeCardActive]}
            onPress={() => onModeChange('donate')}
          >
            <View style={[styles.modeIconBox, { backgroundColor: colors.terracotta + '18' }]}>
              <Feather name="heart" size={22} color={colors.terracotta} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Sumbangkan ke Mitra Sosial</Text>
              <Text style={styles.modeDesc}>Salurkan kain ke komunitas penjahit dan santri binaan CIRCULAI.</Text>
            </View>
            <View style={[styles.radioOuter, mode === 'donate' && styles.radioOuterActive]}>
              {mode === 'donate' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {mode === 'donate' && (
            <>
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Pilih Mitra Donasi</Text>
              {donationPartners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={[styles.partnerCard, selectedPartner?.id === partner.id && { borderColor: partner.color }]}
                  onPress={() => onPartnerChange(partner)}
                >
                  <View style={[styles.partnerDot, { backgroundColor: partner.color }]} />
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <Text style={styles.partnerLocation}>{partner.location}</Text>
                    <Text style={styles.partnerDesc} numberOfLines={2}>{partner.desc}</Text>
                  </View>
                  {selectedPartner?.id === partner.id && (
                    <Feather name="check-circle" size={18} color={partner.color} />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, (mode === 'donate' && !selectedPartner) && styles.btnDisabled]}
            onPress={onNextToConfirm}
            disabled={mode === 'donate' && !selectedPartner}
          >
            <Text style={styles.btnPrimaryText}>Lanjut ke Konfirmasi</Text>
            <Feather name="arrow-right" size={16} color={colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* ── STEP 5: Konfirmasi ── */}
      {step === STEP_CONFIRM && selectedType && (
        <>
          <Text style={styles.sectionTitle}>Konfirmasi Pengajuan Eco Swap</Text>

          <View style={styles.confirmCard}>
            <ConfirmRow label="Jenis Pakaian" value={selectedType.label} />
            <ConfirmRow label="Kondisi" value={condition} />
            <ConfirmRow label="Jumlah" value={`${quantity} ${selectedType.unit}`} />
            <ConfirmRow
              label="Ekspedisi / Resi"
              value={`${courierName} · ${trackingNumber || '(Resi otomatis)'}`}
            />
            <ConfirmRow
              label="Estimasi Poin"
              value={mode === 'points' ? `+${estimatedPoints} CircularPoints` : `Donasi (${selectedPartner?.name})`}
              valueColor={mode === 'points' ? colors.forest : colors.terracotta}
            />
          </View>

          {/* Verification Notice */}
          <View style={styles.verificationNoticeBox}>
            <Feather name="info" size={15} color={colors.forest} />
            <Text style={styles.verificationNoticeText}>
              Poin akan masuk ke akun Anda setelah Admin / Penjahit memverifikasi foto resi dan fisik pakaian sampai di Eco Hub.
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Catatan Tambahan (opsional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Catatan kondisi bahan, warna, dll..."
            placeholderTextColor={colors.warmGrayLight}
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit}>
            <Feather name="send" size={16} color={colors.white} />
            <Text style={styles.btnPrimaryText}>Kirim Pengajuan Tukar Pakaian</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function ConfirmRow({ label, value, valueColor }) {
  return (
    <View style={styles.confirmRow}>
      <Text style={styles.confirmLabel}>{label}</Text>
      <Text style={[styles.confirmValue, valueColor && { color: valueColor, fontWeight: '900' }]}>{value}</Text>
    </View>
  );
}

// ─── Tab: Poin Saya ────────────────────────────────────────────────────────────
function PoinTab({ circularPoints, tier, nextTier, tierProgress, exchangeHistory, insets }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
      {/* Hero Points Card */}
      <View style={[styles.pointHeroCard, { backgroundColor: tier.color }]}>
        <Text style={styles.pointHeroLabel}>CircularPoints Kamu</Text>
        <Text style={styles.pointHeroValue}>{circularPoints.toLocaleString('id-ID')}</Text>
        <View style={styles.pointTierRow}>
          <Feather name="star" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.pointTierLabel}>Tier {tier.name}</Text>
        </View>
        {nextTier && (
          <View style={styles.tierProgressBar}>
            <View style={[styles.tierProgressFill, { width: `${tierProgress * 100}%` }]} />
          </View>
        )}
        {nextTier && (
          <Text style={styles.tierProgressHint}>
            {nextTier.minPoints - circularPoints} pts lagi ke tier {nextTier.name}
          </Text>
        )}
        {!nextTier && (
          <Text style={styles.tierProgressHint}>Tier tertinggi tercapai</Text>
        )}
      </View>

      {/* Riwayat Eco Swap dengan Status Verifikasi Lengkap */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Status Verifikasi & Riwayat Swap</Text>
      {exchangeHistory.length === 0 ? (
        <View style={styles.emptyBox}>
          <Feather name="refresh-cw" size={28} color={colors.warmGrayLight} />
          <Text style={styles.emptyText}>Belum ada riwayat pengajuan tukar pakaian</Text>
        </View>
      ) : (
        exchangeHistory.map((record) => {
          const itemType = exchangeItemTypes.find((t) => t.id === record.itemTypeId);
          const isWaiting = record.status === 'WAITING_VERIFICATION' || record.status === 'PENDING_SHIPMENT';
          const isApproved = record.status === 'APPROVED' || record.status === 'CLAIMED_BY_TAILOR';

          return (
            <View key={record.id} style={styles.historyCardEnhanced}>
              <View style={styles.historyCardTop}>
                <View style={styles.historyCardLeft}>
                  <Text style={styles.historyIdText}>{record.id}</Text>
                  <Text style={styles.historyProductTitle}>{itemType?.label ?? record.itemTypeId}</Text>
                  <Text style={styles.historyMetaDetail}>
                    Kondisi: {record.condition || 'Bahan Utuh'} · Jumlah: {record.quantity} {itemType?.unit || 'pcs'}
                  </Text>
                  {record.courierName && (
                    <Text style={styles.historyCourierText}>
                      Kurir: {record.courierName} ({record.trackingNumber || '-'})
                    </Text>
                  )}
                </View>

                <View style={[styles.statusBadgeHistory, isApproved ? styles.badgeGreen : isWaiting ? styles.badgeAmber : styles.badgeRed]}>
                  <Text style={[styles.statusBadgeTextHistory, isApproved ? styles.textGreen : isWaiting ? styles.textAmber : styles.textRed]}>
                    {isApproved ? 'DIVERIFIKASI & POIN CAIR' : isWaiting ? 'MENUNGGU VERIFIKASI ADMIN' : 'DITOLAK'}
                  </Text>
                </View>
              </View>

              <View style={styles.historyBottomRow}>
                <Text style={styles.historyDateText}>{record.createdAtLabel}</Text>
                <Text style={[styles.historyPointsHighlight, { color: isApproved ? colors.forest : '#D97706' }]}>
                  {record.mode === 'donate' ? 'Donasi' : `+${record.earnedPoints} pts`}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Tab: Redeem ──────────────────────────────────────────────────────────────
function RedeemTab({ circularPoints, onRedeem, insets }) {
  const [confirming, setConfirming] = useState(null);

  const handlePressRedeem = useCallback((option) => {
    if (circularPoints < option.pointCost) return;
    setConfirming(option);
  }, [circularPoints]);

  const handleConfirm = useCallback(() => {
    if (confirming) {
      onRedeem(confirming);
      setConfirming(null);
    }
  }, [confirming, onRedeem]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.pointSummaryRow}>
        <Feather name="star" size={16} color={colors.warning} />
        <Text style={styles.pointSummaryText}>Poinmu: <Text style={styles.pointSummaryValue}>{circularPoints.toLocaleString('id-ID')} pts</Text></Text>
      </View>

      <Text style={styles.sectionTitle}>Tukar Poin Jadi Voucher</Text>
      <Text style={styles.sectionDesc}>Gunakan CircularPoints-mu untuk diskon pembelian berikutnya.</Text>

      {pointRedemptionOptions.map((option) => {
        const canAfford = circularPoints >= option.pointCost;
        return (
          <View key={option.id} style={[styles.redeemCard, !canAfford && styles.redeemCardDisabled]}>
            <View style={[styles.redeemIconBox, { backgroundColor: canAfford ? colors.forest + '14' : colors.lightGray }]}>
              <Feather name={option.type === 'shipping' ? 'truck' : 'tag'} size={20} color={canAfford ? colors.forest : colors.warmGrayLight} />
            </View>
            <View style={styles.redeemInfo}>
              <Text style={[styles.redeemLabel, !canAfford && { color: colors.warmGrayLight }]}>{option.label}</Text>
              <Text style={styles.redeemDesc}>{option.desc}</Text>
              {option.minPurchase > 0 && (
                <Text style={styles.redeemMinPurchase}>Min. pembelian {formatCurrency(option.minPurchase)}</Text>
              )}
              <Text style={styles.redeemValidity}>Berlaku {option.validDays} hari</Text>
            </View>
            <View style={styles.redeemRight}>
              <View style={styles.redeemCost}>
                <Feather name="star" size={11} color={canAfford ? colors.warning : colors.warmGrayLight} />
                <Text style={[styles.redeemCostText, !canAfford && { color: colors.warmGrayLight }]}>{option.pointCost}</Text>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, !canAfford && styles.redeemBtnDisabled]}
                onPress={() => handlePressRedeem(option)}
                disabled={!canAfford}
              >
                <Text style={[styles.redeemBtnText, !canAfford && { color: colors.warmGrayLight }]}>
                  {canAfford ? 'Tukar' : 'Kurang'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Confirm Modal */}
      {confirming && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Konfirmasi Penukaran</Text>
            <Text style={styles.modalDesc}>
              Tukar <Text style={{ fontWeight: '700', color: colors.warning }}>{confirming.pointCost} pts</Text> untuk{' '}
              <Text style={{ fontWeight: '700' }}>{confirming.label}</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setConfirming(null)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirm}>
                <Text style={styles.modalConfirmText}>Ya, Tukar!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ivory },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ivoryDark, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, letterSpacing: -0.3 },
  headerSub: { fontSize: 11, color: colors.warmGray, marginTop: 1 },

  // Point badge
  pointBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, gap: 4 },
  pointBadgeText: { fontSize: 12, fontWeight: '700' },
  pointBadgeSmall: { paddingHorizontal: 7, paddingVertical: 3 },
  pointBadgeTextSmall: { fontSize: 11 },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.lightGray, paddingHorizontal: 16 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: colors.forest },
  tabLabel: { fontSize: 12, color: colors.warmGray, fontWeight: '500' },
  tabLabelActive: { color: colors.forest, fontWeight: '700' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },

  // Section
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: 4, marginTop: 8 },
  sectionDesc: { fontSize: 13, color: colors.warmGray, lineHeight: 18, marginBottom: 16 },

  // Type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '47%', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1.5, padding: 14, gap: 6, ...shadows.sm },
  typeIconBox: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  typeDesc: { fontSize: 11, color: colors.warmGray, lineHeight: 16 },
  typePointRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  typePointText: { fontSize: 11, color: colors.warning, fontWeight: '600' },

  // Step header
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepDots: { flexDirection: 'row', gap: 6, marginLeft: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lightGray },
  stepDotActive: { backgroundColor: colors.forest },

  // Selected type bar
  selectedTypeBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, borderLeftWidth: 3, padding: 12, marginBottom: 20, gap: 10, ...shadows.sm },
  typeIconBoxSm: { width: 32, height: 32, borderRadius: radius.xs, alignItems: 'center', justifyContent: 'center' },
  selectedTypeInfo: { flex: 1 },
  selectedTypeLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  selectedTypeRate: { fontSize: 11, color: colors.warmGray },

  // Field
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.charcoal, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  qtyRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  qtyInput: { flex: 1, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray, borderRadius: radius.sm, padding: 12, fontSize: 16, fontWeight: '600', color: colors.charcoal },
  qtyUnit: { backgroundColor: colors.sand, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center' },
  qtyUnitText: { fontSize: 13, fontWeight: '700', color: colors.forest },

  // Estimate
  estimateBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningLight, borderRadius: radius.sm, padding: 12, marginBottom: 16 },
  estimateText: { fontSize: 13, color: colors.charcoal },
  estimatePoints: { fontWeight: '800', color: colors.warning },

  // Conditions
  conditionList: { gap: 6, marginBottom: 20 },
  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conditionText: { fontSize: 12, color: colors.charcoal },

  // Mode cards
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.lightGray, padding: 14, marginBottom: 12, gap: 12, ...shadows.sm },
  modeCardActive: { borderColor: colors.forest, backgroundColor: colors.successLight },
  modeIconBox: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  modeDesc: { fontSize: 12, color: colors.warmGray, lineHeight: 17 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.lightGrayDark, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: colors.forest },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest },

  // Partner
  partnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.lightGray, padding: 12, marginBottom: 8, gap: 10 },
  partnerDot: { width: 10, height: 10, borderRadius: 5 },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  partnerLocation: { fontSize: 11, color: colors.warmGray },
  partnerDesc: { fontSize: 11, color: colors.warmGray, lineHeight: 16, marginTop: 2 },
  partnerBenef: { fontSize: 11, color: colors.success, fontWeight: '600', marginTop: 2 },

  // Confirm card
  confirmCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: 16, marginBottom: 16, ...shadows.sm },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  confirmLabel: { fontSize: 12, color: colors.warmGray, flex: 1 },
  confirmValue: { fontSize: 13, fontWeight: '700', color: colors.charcoal, flex: 1, textAlign: 'right' },

  // Notes
  notesInput: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.lightGray, borderRadius: radius.sm, padding: 12, fontSize: 13, color: colors.charcoal, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },

  // Shipping info
  shippingBox: { flexDirection: 'row', gap: 10, backgroundColor: colors.infoLight, borderRadius: radius.sm, padding: 14, marginBottom: 20 },
  shippingInfo: { flex: 1 },
  shippingTitle: { fontSize: 12, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  shippingAddr: { fontSize: 12, color: colors.charcoal, lineHeight: 17 },
  shippingNote: { fontSize: 11, color: colors.info, marginTop: 4 },

  // Buttons
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.forest, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 24, marginTop: 8, ...shadows.forest },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: colors.white, letterSpacing: 0.3 },
  btnDisabled: { backgroundColor: colors.lightGray, ...shadows.sm },

  // Success
  successCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 24, alignItems: 'center', gap: 12, ...shadows.md },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle: { fontSize: 20, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  successDesc: { fontSize: 13, color: colors.warmGray, textAlign: 'center', lineHeight: 20 },
  successPointRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warningLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
  successPointText: { fontSize: 18, fontWeight: '800', color: colors.warning },
  successInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  successInfoLabel: { fontSize: 12, color: colors.warmGray },
  successInfoValue: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  successAddress: { flexDirection: 'row', gap: 8, backgroundColor: colors.ivoryDark, borderRadius: radius.sm, padding: 12, width: '100%' },
  successAddressText: { fontSize: 12, color: colors.charcoal, flex: 1, lineHeight: 18 },

  // Points hero
  pointHeroCard: { borderRadius: radius.xl, padding: 24, marginBottom: 20, alignItems: 'center', gap: 6 },
  pointHeroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  pointHeroValue: { fontSize: 42, fontWeight: '900', color: colors.white, letterSpacing: -2 },
  pointTierRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pointTierLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  tierProgressBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginTop: 8 },
  tierProgressFill: { height: 6, backgroundColor: colors.white, borderRadius: 3 },
  tierProgressHint: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Tier list
  tierList: { gap: 8, marginBottom: 20 },
  tierItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.lightGray, padding: 12, gap: 10 },
  tierItemActive: { borderColor: colors.forest, backgroundColor: colors.successLight },
  tierDot: { width: 12, height: 12, borderRadius: 6 },
  tierItemInfo: { flex: 1 },
  tierItemName: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  tierItemRange: { fontSize: 11, color: colors.warmGray },

  // History
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.sm, padding: 12, marginBottom: 8, gap: 10, ...shadows.sm },
  historyDot: { width: 10, height: 10, borderRadius: 5 },
  historyInfo: { flex: 1 },
  historyProduct: { fontSize: 13, fontWeight: '600', color: colors.charcoal },
  historyDate: { fontSize: 11, color: colors.warmGray },
  historyStatus: { fontSize: 11, color: colors.info, marginTop: 2 },
  historyPoints: { fontSize: 13, fontWeight: '700' },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 13, color: colors.warmGrayLight },

  // Redeem
  pointSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.warningLight, borderRadius: radius.sm, padding: 12, marginBottom: 16 },
  pointSummaryText: { fontSize: 13, color: colors.charcoal },
  pointSummaryValue: { fontWeight: '800', color: colors.warning },

  redeemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lightGray, padding: 14, marginBottom: 10, gap: 12, ...shadows.sm },
  redeemCardDisabled: { opacity: 0.55 },
  redeemIconBox: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  redeemInfo: { flex: 1 },
  redeemLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  redeemDesc: { fontSize: 11, color: colors.warmGray, lineHeight: 16 },
  redeemMinPurchase: { fontSize: 10, color: colors.warmGray, marginTop: 2 },
  redeemValidity: { fontSize: 10, color: colors.warmGray },
  redeemRight: { alignItems: 'center', gap: 6 },
  redeemCost: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  redeemCostText: { fontSize: 13, fontWeight: '800', color: colors.warning },
  redeemBtn: { backgroundColor: colors.forest, borderRadius: radius.xs, paddingHorizontal: 12, paddingVertical: 6 },
  redeemBtnDisabled: { backgroundColor: colors.lightGray },
  redeemBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },

  // Modal overlay
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(31,36,33,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 24, margin: 24, gap: 12, ...shadows.xl },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.charcoal, textAlign: 'center' },
  modalDesc: { fontSize: 13, color: colors.charcoal, textAlign: 'center', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, backgroundColor: colors.lightGray, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 13, fontWeight: '600', color: colors.charcoal },
  modalConfirm: { flex: 1, backgroundColor: colors.forest, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center' },
  modalConfirmText: { fontSize: 13, fontWeight: '700', color: colors.white },

  // Enhanced Eco Swap Elements
  conditionChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 },
  conditionChipItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  conditionChipItemActive: { backgroundColor: '#EDF7EE', borderColor: colors.forest },
  conditionChipItemText: { fontSize: 12, color: colors.warmGray, fontWeight: '600' },
  conditionChipItemTextActive: { color: colors.forest, fontWeight: '800' },

  photoUploadCard: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.lightGray, marginTop: 4, marginBottom: 16 },
  photoPreview: { width: 80, height: 90, borderRadius: 8, backgroundColor: colors.sand },
  photoActionCol: { flex: 1, justifyContent: 'center' },
  photoHint: { fontSize: 11, color: colors.warmGray, lineHeight: 15 },
  photoButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#EDF7EE', borderWidth: 1, borderColor: colors.forest },
  photoBtnText: { fontSize: 11, fontWeight: '700', color: colors.forest },

  modalInputText: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: colors.charcoal, marginTop: 4, marginBottom: 8 },
  verificationNoticeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDF7EE', padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 12 },
  verificationNoticeText: { flex: 1, fontSize: 11, color: colors.forest, lineHeight: 16 },

  successSummaryCard: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginVertical: 14, width: '100%', borderWidth: 1, borderColor: colors.lightGray },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },

  historyCardEnhanced: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.lightGray, ...shadows.sm },
  historyCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyCardLeft: { flex: 1, marginRight: 8 },
  historyIdText: { fontSize: 10, fontWeight: '800', color: colors.forest },
  historyProductTitle: { fontSize: 13, fontWeight: '800', color: colors.charcoal, marginTop: 2 },
  historyMetaDetail: { fontSize: 11, color: colors.warmGray, marginTop: 2 },
  historyCourierText: { fontSize: 11, color: '#0284C7', fontWeight: '700', marginTop: 2 },
  statusBadgeHistory: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeTextHistory: { fontSize: 9, fontWeight: '800' },
  historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  historyDateText: { fontSize: 10, color: colors.warmGrayLight },
  historyPointsHighlight: { fontSize: 13, fontWeight: '900' },

  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  textGreen: { color: '#15803D' },
  textAmber: { color: '#D97706' },
  textRed: { color: '#DC2626' },
});
