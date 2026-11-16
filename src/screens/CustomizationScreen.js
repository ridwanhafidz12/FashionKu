import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedPressable from '../components/AnimatedPressable';
import FlowHeader from '../components/FlowHeader';
import { customizationColors, customizationFabrics, formatCurrency } from '../data/appData';
import { useAppState } from '../state/AppContext';
import { colors, shadows } from '../theme/colors';

const measurementFields = [
  ['chest', 'Lingkar dada'],
  ['waist', 'Lingkar pinggang'],
  ['hips', 'Lingkar pinggul'],
  ['length', 'Panjang pakaian'],
];

const sampleSwatches = [
  'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80',
];

export default function CustomizationScreen({ product, initial = {}, onBack, onGoCart, onChat }) {
  const insets = useSafeAreaInsets();
  const { addToCart, styleProfile, requireAuth } = useAppState();

  const [selectedColor, setSelectedColor] = useState(
    customizationColors.find((item) => item.recommended) || customizationColors[0]
  );
  const [isCustomColorMode, setIsCustomColorMode] = useState(false);
  const [customHex, setCustomHex] = useState('#6A994E');
  const [customColorName, setCustomColorName] = useState('Sage Olive Custom');
  const [sampleFabricPhoto, setSampleFabricPhoto] = useState(null);

  const [selectedFabric, setSelectedFabric] = useState(customizationFabrics[0]);
  const [sizeType, setSizeType] = useState(initial.size === 'Custom' ? 'custom' : 'standard');
  const [size, setSize] = useState(initial.size && initial.size !== 'Custom' ? initial.size : 'M');
  const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '', length: '' });

  const total = useMemo(() => product.price + selectedFabric.extraCost, [product.price, selectedFabric]);

  const activeFinalColor = isCustomColorMode
    ? { id: 'custom', label: customColorName || 'Warna Kustom', hex: customHex || '#2C6842', isCustom: true }
    : selectedColor;

  const handleAdd = () => {
    if (!activeFinalColor || !selectedFabric) {
      Alert.alert('Lengkapi pilihan', 'Warna dan bahan harus dipilih.');
      return;
    }
    if (sizeType === 'custom' && Object.values(measurements).some((value) => !value.trim() || Number(value) <= 0)) {
      Alert.alert(
        'Ukuran belum valid',
        'Isi seluruh ukuran tubuh dengan angka lebih dari 0 agar tailor dapat membuat pola dengan presisi.'
      );
      return;
    }
    requireAuth(() => {
      addToCart(product, {
        color: activeFinalColor,
        customFabricPhoto: sampleFabricPhoto,
        fabric: selectedFabric,
        sizeType,
        size,
        measurements: sizeType === 'custom' ? measurements : null,
        notes: initial.notes ?? '',
      });
      onGoCart();
    }, 'Silakan masuk ke akun FashionKu untuk menambahkan produk ke keranjang.');
  };

  const handlePickSampleSwatch = (url) => {
    setSampleFabricPhoto(url);
    Alert.alert('Sampel Warna Dipilih', 'Foto contoh warna kain telah dilampirkan untuk referensi penjahit.');
  };

  return (
    <View style={styles.screen}>
      <FlowHeader title="Kustomisasi Pesanan" subtitle="Warna, ukuran, dan bahan" onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 36 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Info Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productTailor}>Dikerjakan oleh {product.tailor}</Text>
            <Text style={styles.productPrice}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Chat Penjahit Shortcut */}
        <AnimatedPressable
          style={styles.chatTailorBanner}
          onPress={onChat}
          scaleDown={0.97}
        >
          <View style={styles.chatTailorIcon}>
            <Feather name="message-circle" size={18} color={colors.forest} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatTailorTitle}>Diskusi & Chat Penjahit ({product.tailor})</Text>
            <Text style={styles.chatTailorDesc}>
              Tanya stok kain sisa di workshop, konsultasi fitting ukuran, atau request model khusus.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.forest} />
        </AnimatedPressable>

        {/* STEP 1: PILIH WARNA KAIN & COLOR PICKER */}
        <StepTitle
          number="1"
          title="Pilihan Warna Kain Bebas"
          subtitle={styleProfile ? 'Pilihan warna bebas tak terbatas. Tersedia Color Picker & Upload Contoh Warna.' : 'Pilih dari palet atau tentukan warna kain kustom sendiri.'}
        />

        {/* Toggle Mode Warna */}
        <View style={styles.colorModeToggle}>
          <Pressable
            style={[styles.colorModeBtn, !isCustomColorMode && styles.colorModeBtnActive]}
            onPress={() => setIsCustomColorMode(false)}
          >
            <Text style={[styles.colorModeText, !isCustomColorMode && styles.colorModeTextActive]}>
              Palet Sirkular
            </Text>
          </Pressable>
          <Pressable
            style={[styles.colorModeBtn, isCustomColorMode && styles.colorModeBtnActive]}
            onPress={() => setIsCustomColorMode(true)}
          >
            <Text style={[styles.colorModeText, isCustomColorMode && styles.colorModeTextActive]}>
              🎨 Color Picker Bebas
            </Text>
          </Pressable>
        </View>

        {!isCustomColorMode ? (
          <View style={styles.colorGrid}>
            {customizationColors.map((item) => {
              const selected = selectedColor?.id === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  style={[styles.colorCard, selected && styles.selectedCard]}
                  onPress={() => setSelectedColor(item)}
                >
                  <View style={[styles.swatch, { backgroundColor: item.hex }]}>
                    {selected && <Feather name="check" size={16} color={colors.white} />}
                  </View>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  {item.recommended && <Text style={styles.recommended}>COCOK UNTUKMU</Text>}
                </AnimatedPressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.customColorBox}>
            <View style={styles.customColorHeader}>
              <View style={[styles.customSwatchPreview, { backgroundColor: customHex || '#2C6842' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.customColorTitle}>{customColorName || 'Warna Kustom'}</Text>
                <Text style={styles.customColorHexCode}>{customHex.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Kode HEX Warna (Contoh: #2C6842, #E07A5F, #3D5A80):</Text>
            <View style={styles.hexInputRow}>
              <TextInput
                style={styles.hexInput}
                value={customHex}
                onChangeText={setCustomHex}
                placeholder="#RRGGBB"
                placeholderTextColor={colors.warmGray}
                maxLength={7}
                autoCapitalize="characters"
              />
              <View style={styles.quickHexList}>
                {['#2C6842', '#B85D43', '#E07A5F', '#3D5A80', '#D4A373', '#6B705C', '#1D3557'].map((hex) => (
                  <Pressable
                    key={hex}
                    style={[styles.miniHexDot, { backgroundColor: hex }]}
                    onPress={() => setCustomHex(hex)}
                  />
                ))}
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Nama / Nuansa Warna Yang Diinginkan:</Text>
            <TextInput
              style={styles.textInputBox}
              value={customColorName}
              onChangeText={setCustomColorName}
              placeholder="Contoh: Hijau Sage Tua, Terakota Hangat, Biru Indigo..."
              placeholderTextColor={colors.warmGray}
            />
          </View>
        )}

        {/* Upload Foto Contoh Warna Kain */}
        <View style={styles.uploadFabricSection}>
          <View style={styles.uploadFabricHeader}>
            <Feather name="image" size={16} color={colors.forest} />
            <Text style={styles.uploadFabricTitle}>Upload Foto Contoh Warna Kain</Text>
          </View>
          <Text style={styles.uploadFabricDesc}>
            Punya contoh kain atau foto outfit dengan warna yang kamu mau? Lampirkan di sini agar penjahit mencocokkan kain deadstock yang ada di workshop.
          </Text>

          {sampleFabricPhoto ? (
            <View style={styles.samplePreviewRow}>
              <Image source={{ uri: sampleFabricPhoto }} style={styles.samplePreviewImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.samplePreviewLabel}>Foto Contoh Warna Terlampir</Text>
                <Text style={styles.samplePreviewSub}>Penjahit akan mencari kain sisa yang paling mendekati foto ini.</Text>
                <Pressable onPress={() => setSampleFabricPhoto(null)}>
                  <Text style={styles.sampleRemoveText}>Hapus Foto</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.samplePickerBox}>
              <Text style={styles.samplePickerPrompt}>Pilih salah satu sampel cepat atau simulasikan upload foto kain:</Text>
              <View style={styles.sampleThumbRow}>
                {sampleSwatches.map((url, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.sampleThumbItem}
                    onPress={() => handlePickSampleSwatch(url)}
                  >
                    <Image source={{ uri: url }} style={styles.sampleThumbImg} />
                    <Text style={styles.sampleThumbText}>Sampel {idx + 1}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* STEP 2: TENTUKAN UKURAN */}
        <StepTitle number="2" title="Tentukan Ukuran" subtitle="Gunakan ukuran standar atau masukkan ukuran tubuh." />
        <View style={styles.toggle}>
          {['standard', 'custom'].map((item) => (
            <AnimatedPressable
              key={item}
              style={[styles.toggleButton, sizeType === item && styles.toggleButtonActive]}
              onPress={() => setSizeType(item)}
            >
              <Text style={[styles.toggleText, sizeType === item && styles.toggleTextActive]} numberOfLines={1}>
                {item === 'standard' ? 'Ukuran Standar' : 'Custom Measurements'}
              </Text>
            </AnimatedPressable>
          ))}
        </View>

        {sizeType === 'standard' ? (
          <View style={styles.sizeRow}>
            {['XS', 'S', 'M', 'L', 'XL'].map((item) => (
              <AnimatedPressable
                key={item}
                style={[styles.size, size === item && styles.sizeActive]}
                onPress={() => setSize(item)}
              >
                <Text style={[styles.sizeText, size === item && styles.sizeTextActive]}>{item}</Text>
              </AnimatedPressable>
            ))}
          </View>
        ) : (
          <View style={styles.measureCard}>
            {measurementFields.map(([key, label]) => (
              <View key={key} style={styles.measureRow}>
                <Text style={styles.measureLabel}>{label}</Text>
                <TextInput
                  value={measurements[key]}
                  onChangeText={(value) => setMeasurements((current) => ({ ...current, [key]: value }))}
                  placeholder="cm"
                  placeholderTextColor={colors.warmGrayLight}
                  keyboardType="decimal-pad"
                  style={styles.measureInput}
                />
              </View>
            ))}
          </View>
        )}

        {/* STEP 3: PILIH BAHAN */}
        <StepTitle number="3" title="Pilih Bahan Kain Sirkular" subtitle="Harga menyesuaikan jenis kain sisa atelier yang dipilih." />
        <View style={styles.fabricList}>
          {customizationFabrics.map((item) => {
            const selected = selectedFabric.id === item.id;
            return (
              <AnimatedPressable
                key={item.id}
                style={[styles.fabricCard, selected && styles.selectedCard]}
                onPress={() => setSelectedFabric(item)}
              >
                <View style={[styles.radio, selected && styles.radioActive]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.fabricInfo}>
                  <Text style={styles.fabricName}>{item.label}</Text>
                  <Text style={styles.fabricDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.fabricPrice}>
                  {item.extraCost ? `+${formatCurrency(item.extraCost)}` : 'Termasuk'}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>Estimasi total pesanan</Text>
            <Text style={styles.summaryPrice}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.estimate}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.forest} />
            <Text style={styles.estimateText}>{product.eta} produksi</Text>
          </View>
        </View>

        <AnimatedPressable style={styles.cta} onPress={handleAdd}>
          <Feather name="shopping-bag" size={17} color={colors.white} />
          <Text style={styles.ctaText}>Tambah ke Keranjang</Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

function StepTitle({ number, title, subtitle }) {
  return (
    <View style={styles.stepTitle}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepName}>{title}</Text>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, paddingBottom: 40 },
  productCard: {
    flexDirection: 'row',
    gap: 13,
    padding: 13,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  image: { width: 78, height: 92, borderRadius: 14, backgroundColor: colors.sand },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { color: colors.charcoal, fontSize: 16, fontWeight: '900' },
  productTailor: { color: colors.warmGray, fontSize: 11, marginTop: 3 },
  productPrice: { color: colors.forest, fontSize: 16, fontWeight: '900', marginTop: 8 },
  chatTailorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.sandLight,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  chatTailorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTailorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.forest,
  },
  chatTailorDesc: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
    lineHeight: 14,
  },
  stepTitle: { flexDirection: 'row', gap: 10, marginTop: 22, marginBottom: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  stepNumberText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  stepCopy: { flex: 1 },
  stepName: { color: colors.charcoal, fontSize: 15, fontWeight: '900' },
  stepSubtitle: { color: colors.warmGray, fontSize: 11, lineHeight: 15, marginTop: 2 },
  colorModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  colorModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  colorModeBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  colorModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warmGray,
  },
  colorModeTextActive: {
    color: colors.forest,
    fontWeight: '900',
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  colorCard: {
    width: '48%',
    minHeight: 106,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  selectedCard: { borderColor: colors.forest, backgroundColor: colors.successLight },
  swatch: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  optionLabel: {
    color: colors.charcoal,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  recommended: { color: colors.forest, fontSize: 8, lineHeight: 11, fontWeight: '900', marginTop: 4 },
  customColorBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  customColorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  customSwatchPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  customColorTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.charcoal,
  },
  customColorHexCode: {
    fontSize: 12,
    color: colors.forest,
    fontWeight: '800',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 6,
  },
  hexInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hexInput: {
    width: 100,
    height: 40,
    backgroundColor: colors.ivory,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '800',
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.lightGray,
    textAlign: 'center',
  },
  quickHexList: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniHexDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.white,
    ...shadows.sm,
  },
  textInputBox: {
    height: 40,
    backgroundColor: colors.ivory,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  uploadFabricSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...shadows.sm,
  },
  uploadFabricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadFabricTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.charcoal,
  },
  uploadFabricDesc: {
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 4,
    lineHeight: 16,
  },
  samplePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: colors.sandLight,
    padding: 10,
    borderRadius: 12,
  },
  samplePreviewImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  samplePreviewLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.forest,
  },
  samplePreviewSub: {
    fontSize: 10,
    color: colors.warmGray,
    marginTop: 2,
    lineHeight: 14,
  },
  sampleRemoveText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.error,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  samplePickerBox: {
    marginTop: 10,
  },
  samplePickerPrompt: {
    fontSize: 10,
    color: colors.warmGray,
    marginBottom: 8,
  },
  sampleThumbRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sampleThumbItem: {
    alignItems: 'center',
    gap: 4,
  },
  sampleThumbImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sampleThumbText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal,
  },
  toggle: {
    flexDirection: 'row',
    gap: 7,
    padding: 4,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
  },
  toggleButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  toggleButtonActive: { backgroundColor: colors.white },
  toggleText: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  toggleTextActive: { color: colors.forest, fontWeight: '900' },
  sizeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  size: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sizeActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  sizeText: { color: colors.charcoal, fontWeight: '800' },
  sizeTextActive: { color: colors.white },
  measureCard: {
    marginTop: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  measureLabel: { color: colors.charcoal, fontSize: 11, fontWeight: '700' },
  measureInput: {
    width: 90,
    height: 34,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.charcoal,
    textAlign: 'right',
    backgroundColor: colors.ivory,
  },
  fabricList: { gap: 8 },
  fabricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
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
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forest },
  fabricInfo: { flex: 1, minWidth: 0 },
  fabricName: { color: colors.charcoal, fontSize: 12, fontWeight: '900' },
  fabricDesc: { color: colors.warmGray, fontSize: 9, marginTop: 2 },
  fabricPrice: { color: colors.forest, fontSize: 10, fontWeight: '900' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.sand,
  },
  summaryLabel: { color: colors.warmGray, fontSize: 10 },
  summaryPrice: { color: colors.forest, fontSize: 20, fontWeight: '900', marginTop: 2 },
  estimate: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  estimateText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  cta: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.forest,
    marginTop: 14,
    ...shadows.forest,
  },
  ctaText: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' },
});
