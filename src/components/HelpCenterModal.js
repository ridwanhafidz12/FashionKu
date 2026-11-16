/**
 * @file HelpCenterModal.js
 * @description Pusat Bantuan & Komplain untuk CIRCULAI / FashionKu.
 *
 * Mengarahkan customer langsung ke resolusi komplain dengan Admin jika pakaian
 * tidak sesuai ukuran kesepakatan, cacat jahitan, atau kendala pengiriman.
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows } from '../theme/colors';
import { useAppState } from '../state/AppContext';

const COMPLAINT_TOPICS = [
  { id: 'size_mismatch', label: 'Ukuran Tidak Sesuai Kesepakatan', icon: 'ruler' },
  { id: 'defect', label: 'Cacat Jahitan / Kerusakan Pakaian', icon: 'scissors' },
  { id: 'shipping_delay', label: 'Pengiriman Terlambat / Resi Terkendala', icon: 'truck' },
  { id: 'wrong_material', label: 'Bahan atau Warna Tidak Sesuai', icon: 'palette' },
  { id: 'payment_issue', label: 'Kendala Pembayaran / Midtrans', icon: 'credit-card' },
];

export default function HelpCenterModal({ visible, onClose, order = null, onNavigate }) {
  const insets = useSafeAreaInsets();
  const { setNotice, addNotification } = useAppState();

  const [selectedTopic, setSelectedTopic] = useState(COMPLAINT_TOPICS[0].id);
  const [complaintText, setComplaintText] = useState('');

  if (!visible) return null;

  const handleSubmitComplaint = () => {
    const topic = COMPLAINT_TOPICS.find((t) => t.id === selectedTopic);
    const complaintSummary = complaintText.trim() || 'Pelanggan mengajukan bantuan via Pusat Bantuan.';
    
    addNotification({
      title: 'Tiket Komplain Diterima 🛡️',
      message: `Keluhan "${topic?.label}" sedang ditangani oleh Tim Resolusi FashionKu. Admin akan segera menghubungi Anda via chat.`,
      type: 'info',
      orderId: order?.id,
    });

    setNotice('Komplain diterima! Tim Support FashionKu akan segera merespons.');
    onClose();

    // Optionally route to Tailor / Admin chat
    setTimeout(() => {
      Alert.alert(
        'Tiket Resolusi Terbuka',
        `Tiket resolusi untuk pesanan ${order?.id || 'Anda'} telah dibuat.\n\nTopik: ${topic?.label}\n\nAdmin telah menerima komplain Anda dan akan mendampingi penyesuaian ukuran gratis dengan penjahit.`,
        [{ text: 'Mengerti', style: 'default' }]
      );
    }, 400);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.shieldIconWrap}>
                <Feather name="shield" size={16} color={colors.forest} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Pusat Bantuan & Komplain</Text>
                <Text style={styles.headerSub}>
                  {order ? `Pesanan #${order.id} · Garansi Pas FashionKu` : 'Layanan Bantuan 24/7 Pelanggan'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <Feather name="x" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Guarantee Banner */}
            <View style={styles.guaranteeBanner}>
              <MaterialCommunityIcons name="shield-check" size={20} color={colors.forest} />
              <View style={{ flex: 1 }}>
                <Text style={styles.guaranteeTitle}>Garansi Pas & Rekber Aman</Text>
                <Text style={styles.guaranteeDesc}>
                  Dana Anda ditahan aman di Rekber FashionKu. Jika ukuran tidak sesuai dengan kesepakatan fitting, Anda berhak mendapat perbaikan jahit gratis atau refund.
                </Text>
              </View>
            </View>

            {/* Topic Selection */}
            <Text style={styles.sectionTitle}>Pilih Kendala / Topik Komplain</Text>
            <View style={styles.topicList}>
              {COMPLAINT_TOPICS.map((topic) => {
                const active = selectedTopic === topic.id;
                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[styles.topicItem, active && styles.topicItemActive]}
                    onPress={() => setSelectedTopic(topic.id)}
                  >
                    <View style={[styles.topicIconWrap, active && styles.topicIconWrapActive]}>
                      <MaterialCommunityIcons
                        name={topic.icon}
                        size={16}
                        color={active ? colors.forest : colors.warmGray}
                      />
                    </View>
                    <Text style={[styles.topicLabel, active && styles.topicLabelActive]}>
                      {topic.label}
                    </Text>
                    {active && <Feather name="check" size={14} color={colors.forest} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description Input */}
            <Text style={styles.sectionTitle}>Jelaskan Detail Masalah</Text>
            <TextInput
              style={styles.textArea}
              value={complaintText}
              onChangeText={setComplaintText}
              placeholder="Contoh: Lingkar pinggang dress 4cm lebih sempit dari ukuran custom yang disepakati..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Action Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitComplaint}>
              <Feather name="send" size={15} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Kirim Komplain & Chat Admin</Text>
            </TouchableOpacity>

            {/* FAQ Box */}
            <View style={styles.faqCard}>
              <Text style={styles.faqTitle}>FAQ Singkat:</Text>
              <Text style={styles.faqItem}>• <Text style={styles.bold}>Bagaimana jika baju kekecilan?</Text> Penjahit mitra memberikan jaminan 1x vermak/alterasi gratis.</Text>
              <Text style={styles.faqItem}>• <Text style={styles.bold}>Kapan dana Rekber cair?</Text> Dana baru diteruskan ke penjahit setelah Anda klik "Pesanan Diterima".</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '900',
  },
  headerSub: {
    color: colors.warmGray,
    fontSize: 10,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 20,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EDF7EE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  guaranteeTitle: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  guaranteeDesc: {
    color: '#335C3D',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 8,
  },
  topicList: {
    gap: 8,
    marginBottom: 14,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topicItemActive: {
    backgroundColor: '#EDF7EE',
    borderColor: colors.forest,
  },
  topicIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  topicIconWrapActive: {
    backgroundColor: '#DCFCE7',
  },
  topicLabel: {
    flex: 1,
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
  },
  topicLabelActive: {
    color: colors.charcoal,
    fontWeight: '800',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 12,
    color: colors.charcoal,
    minHeight: 80,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.forest,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
    ...shadows.forest,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  faqCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqTitle: {
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  faqItem: {
    color: colors.warmGray,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: colors.charcoal,
  },
});
