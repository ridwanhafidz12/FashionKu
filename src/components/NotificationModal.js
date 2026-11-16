/**
 * @file NotificationModal.js
 * @description In-app notification sheet modal for CIRCULAI / FashionKu.
 *
 * Mendukung notifikasi ringan:
 * - Update pengerjaan dan pengiriman pesanan
 * - Chat masuk dari penjahit
 * - Poin Eco Swap cair setelah diverifikasi Admin
 * - Pelepasan dana Rekber
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows } from '../theme/colors';
import { useAppState } from '../state/AppContext';

export default function NotificationModal({ visible, onClose, onNavigate }) {
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationsAsRead, unreadNotificationCount } = useAppState();
  const [filter, setFilter] = useState('all'); // 'all' | 'order' | 'swap' | 'chat'

  if (!visible) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'order':
        return { name: 'package', color: '#0284C7', bg: '#E0F2FE' };
      case 'swap':
        return { name: 'recycle', color: colors.forest, bg: '#EDF7EE' };
      case 'chat':
        return { name: 'message-circle', color: '#7C3AED', bg: '#EDE9FE' };
      case 'escrow':
        return { name: 'shield-check', color: '#D97706', bg: '#FEF3C7' };
      default:
        return { name: 'bell', color: colors.charcoal, bg: '#F1F5F9' };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.bellIconWrap}>
                <Feather name="bell" size={16} color={colors.forest} />
                {unreadNotificationCount > 0 && <View style={styles.redDot} />}
              </View>
              <Text style={styles.headerTitle}>Notifikasi</Text>
            </View>

            <View style={styles.headerRight}>
              {unreadNotificationCount > 0 && (
                <TouchableOpacity style={styles.markReadBtn} onPress={markNotificationsAsRead}>
                  <Text style={styles.markReadText}>Tandai Dibaca</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={10}>
                <Feather name="x" size={20} color={colors.charcoal} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'order', label: 'Pesanan' },
              { id: 'swap', label: 'Eco Swap' },
              { id: 'chat', label: 'Chat' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notifications List */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="bell-off" size={36} color={colors.warmGrayLight} />
                <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
                <Text style={styles.emptyDesc}>Update pesanan, pesan penjahit, dan poin swap akan muncul di sini.</Text>
              </View>
            ) : (
              filtered.map((item) => {
                const iconCfg = getIconForType(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, !item.read && styles.itemCardUnread]}
                    onPress={() => {
                      onClose();
                      if (item.type === 'order') onNavigate('orders');
                      else if (item.type === 'swap') onNavigate('exchange');
                      else if (item.type === 'chat') onNavigate('explore');
                    }}
                  >
                    <View style={[styles.itemIcon, { backgroundColor: iconCfg.bg }]}>
                      <MaterialCommunityIcons name={iconCfg.name} size={18} color={iconCfg.color} />
                    </View>
                    <View style={styles.itemBody}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemTime}>{item.timestamp}</Text>
                      </View>
                      <Text style={styles.itemMessage}>{item.message}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })
            )}
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
    maxHeight: '80%',
    minHeight: '50%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    color: colors.forest,
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#EDF7EE',
    borderWidth: 1,
    borderColor: colors.forest,
  },
  filterChipText: {
    color: colors.warmGray,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.forest,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyDesc: {
    color: colors.warmGray,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 30,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemCardUnread: {
    backgroundColor: '#F8FCF8',
    borderColor: '#D1E7D5',
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '800',
  },
  itemTime: {
    color: colors.warmGrayLight,
    fontSize: 10,
  },
  itemMessage: {
    color: colors.warmGray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.forest,
    alignSelf: 'center',
  },
});
