/**
 * @file Footer.js
 * @description Corporate Multi-Column Footer directly modeled after Laprakin Web ID
 * (C:\Users\gatau\Downloads\BOT APLIKASI PREM\BOT BUAT LAPRAK\templates_web\index.html & style.css)
 *
 * Layout:
 * - 4-Column Grid:
 *   1. Brand Col: Logo + FashionKu.web.id, Bio, 📍 Universitas Ahmad Dahlan, Yogyakarta
 *   2. MODUL SIRKULAR: Bespoke, Stylist, Eco Swap, Paspor DPP
 *   3. FITUR STANDAR: Garansi Pas 100%, Flat Ongkir, Rekber Escrow, Tracking Resi
 *   4. TENTANG & BANTUAN: Profil Pengembang (Salman), Bantuan, Panel Mitra, WhatsApp Admin
 * - Bottom Bar:
 *   - Left: © 2026 FashionKu by Salman Al Farizi. Dirancang untuk mahasiswa LabTIF UAD & ekosistem fesyen sirkular.
 *   - Right: 3 squircle social buttons (Instagram, GitHub, WhatsApp)
 */

import React, { useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const LOGO = require('../../assets/images/fashionku_icon_transparent.png');

function FooterLinkItem({ label, onPress, url }) {
  const [hovered, setHovered] = useState(false);

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported || Platform.OS === 'web') {
          await Linking.openURL(url);
        }
      } catch {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        }
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={styles.linkPressable}
    >
      <Text style={[styles.linkText, hovered && styles.linkTextHovered]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SocialIconButton({ icon, label, url }) {
  const [hovered, setHovered] = useState(false);

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(url);
      }
    } catch {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityLabel={label}
      style={[
        styles.socialBtn,
        hovered && styles.socialBtnHovered,
      ]}
    >
      <FontAwesome
        name={icon}
        size={15}
        color={hovered ? colors.forest : '#535862'}
      />
    </Pressable>
  );
}

export default function Footer({ onNavigate = () => {}, onOpenScan = () => {}, onOpenHelp = () => {} }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.footerWrap}>
      <View style={styles.footerContainer}>
        {/* ─── 4-Column Top Grid ─────────────────────────────────────────── */}
        <View style={[styles.topGrid, isDesktop ? styles.topGridDesktop : styles.topGridMobile]}>
          {/* Column 1: Brand Column */}
          <View style={[styles.brandCol, isDesktop && styles.brandColDesktop]}>
            <View style={styles.logoRow}>
              <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
              <Text style={styles.logoText}>
                FashionKu<Text style={styles.logoSpan}>.web.id</Text>
              </Text>
            </View>
            <Text style={styles.brandBio}>
              Ekosistem software dan marketplace fesyen sirkular terpadu untuk memberdayakan 134+ artisan penjahit lokal berstandar resmi ramah lingkungan.
            </Text>
            <View style={styles.contactItem}>
              <Feather name="map-pin" size={13} color="#717680" style={{ marginRight: 6 }} />
              <Text style={styles.contactText}>Universitas Ahmad Dahlan, Yogyakarta</Text>
            </View>
          </View>

          {/* Column 2: MODUL SIRKULAR */}
          <View style={styles.navCol}>
            <Text style={styles.colTitle}>MODUL SIRKULAR</Text>
            <View style={styles.linkList}>
              <FooterLinkItem label="Bespoke Kustom Presisi" onPress={() => onNavigate('custom-design')} />
              <FooterLinkItem label="AI Personal Stylist" onPress={() => onNavigate('quiz')} />
              <FooterLinkItem label="Eco Swap Tukar Baju" onPress={() => onNavigate('exchange')} />
              <FooterLinkItem label="Paspor Digital DPP" onPress={onOpenScan} />
            </View>
          </View>

          {/* Column 3: FITUR STANDAR */}
          <View style={styles.navCol}>
            <Text style={styles.colTitle}>FITUR STANDAR</Text>
            <View style={styles.linkList}>
              <FooterLinkItem label="Garansi Ukuran Pas 100%" onPress={onOpenHelp} />
              <FooterLinkItem label="Bebas Ongkir Flat Se-Kota" onPress={() => onNavigate('explore')} />
              <FooterLinkItem label="Rekber Escrow & Midtrans Snap" onPress={() => onNavigate('orders')} />
              <FooterLinkItem label="Tracking Resi & Kurir Otomatis" onPress={() => onNavigate('orders')} />
            </View>
          </View>

          {/* Column 4: TENTANG & BANTUAN */}
          <View style={styles.navCol}>
            <Text style={styles.colTitle}>TENTANG & BANTUAN</Text>
            <View style={styles.linkList}>
              <FooterLinkItem label="Profil Pengembang (Salman)" url="https://instagram.com/whsmann" />
              <FooterLinkItem label="Pusat Bantuan & Komplain" onPress={onOpenHelp} />
              <FooterLinkItem label="Panel Mitra Penjahit" onPress={() => onNavigate('tailor-portal')} />
              <FooterLinkItem label="Bantuan WhatsApp" url="https://wa.me/6281973612917?text=Halo%20Admin%20FashionKu" />
            </View>
          </View>
        </View>

        {/* ─── Bottom Bar ─────────────────────────────────────────────────── */}
        <View style={[styles.bottomBar, isDesktop ? styles.bottomBarDesktop : styles.bottomBarMobile]}>
          <Text style={styles.copyrightText}>
            © 2026 FashionKu by Salman Al Farizi. Seluruh hak cipta dilindungi. Dirancang untuk mahasiswa LabTIF UAD &amp; ekosistem fesyen sirkular.
          </Text>

          <View style={styles.socialWrap}>
            <SocialIconButton
              icon="instagram"
              label="Instagram Pengembang"
              url="https://instagram.com/whsmann"
            />
            <SocialIconButton
              icon="github"
              label="GitHub Repository"
              url="https://github.com/ridwanhafidz12/circulai-ridwan"
            />
            <SocialIconButton
              icon="whatsapp"
              label="Bantuan WhatsApp Resmi"
              url="https://wa.me/6281973612917?text=Halo%20Admin%20FashionKu"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9eaeb',
    marginTop: 48,
    paddingTop: 56,
    paddingBottom: 32,
    width: '100%',
  },
  footerContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  topGrid: {
    marginBottom: 44,
  },
  topGridDesktop: {
    flexDirection: 'row',
    gap: 40,
  },
  topGridMobile: {
    flexDirection: 'column',
    gap: 28,
  },
  brandCol: {
    flex: 1,
  },
  brandColDesktop: {
    flex: 1.8,
    maxWidth: 340,
    paddingRight: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImg: {
    width: 26,
    height: 26,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181d27',
    letterSpacing: -0.3,
  },
  logoSpan: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '800',
  },
  brandBio: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 13.5,
    lineHeight: 22,
    color: '#535862',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#717680',
    fontWeight: '500',
  },
  navCol: {
    flex: 1,
    minWidth: 160,
  },
  colTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181d27',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  linkList: {
    gap: 12,
  },
  linkPressable: {
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  linkText: {
    fontSize: 13.5,
    color: '#535862',
    lineHeight: 20,
    ...(Platform.OS === 'web' ? { transition: 'color 0.15s ease' } : {}),
  },
  linkTextHovered: {
    color: colors.forest,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#e9eaeb',
    paddingTop: 24,
    gap: 16,
  },
  bottomBarDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bottomBarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  copyrightText: {
    fontSize: 13,
    color: '#717680',
    lineHeight: 20,
    flex: 1,
    minWidth: 260,
  },
  socialWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } : {}),
  },
  socialBtnHovered: {
    backgroundColor: '#EDF7EE',
    transform: [{ translateY: -2 }],
  },
});
