import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// High-resolution 512x512 transparent icon without dead borders or squished text
const ICON = require('../../assets/images/fashionku_icon_transparent.png');

export default function SplashScreen({ onDone }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;

  // Animations
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo entry (refined spring)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Content fade in
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 500,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 3. Progress bar fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1700,
      delay: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // 4. Auto dismiss
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 2300);

    return () => clearTimeout(timer);
  }, [onDone, logoOpacity, logoScale, contentFade, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Subtle modern ambient background glow */}
      <View style={[styles.ambientGlow, isDesktop && styles.ambientGlowDesktop]} />

      {/* Main Center Stage */}
      <View style={[styles.centerStage, isDesktop && styles.centerStageDesktop]}>
        {/* Crisp Squircle App Icon Container */}
        <Animated.View
          style={[
            styles.iconWrapper,
            isDesktop && styles.iconWrapperDesktop,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={ICON}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Information */}
        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: contentFade,
              transform: [
                {
                  translateY: contentFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Category Pill */}
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="leaf" size={13} color="#20603D" />
            <Text style={styles.categoryBadgeText}>CIRCULAR FASHION & BESPOKE</Text>
          </View>

          {/* High-DPI Vector Brand Title */}
          <Text style={[styles.brandTitle, isDesktop && styles.brandTitleDesktop]}>
            FashionKu
          </Text>
          <Text style={[styles.brandSubtitle, isDesktop && styles.brandSubtitleDesktop]}>
            Pilihan Busana Berkelanjutan & Penjahit Lokal
          </Text>

          {/* High-Tech Capsule Progress Track */}
          <View style={[styles.progressContainer, isDesktop && styles.progressContainerDesktop]}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressCaption}>Memuat pengalaman terbaik...</Text>
          </View>
        </Animated.View>
      </View>

      {/* Trust & Eco Badge Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBadge}>
          <MaterialCommunityIcons name="shield-check" size={14} color="#64748B" />
          <Text style={styles.footerText}>TERVERIFIKASI & RAMAH LINGKUNGAN</Text>
        </View>
        <Text style={styles.footerCopyright}>
          Didukung oleh Komunitas Penjahit & UMKM Indonesia
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAFBF6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    }),
  },
  ambientGlow: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(32, 96, 61, 0.05)',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        filter: 'blur(60px)',
      },
    }),
  },
  ambientGlowDesktop: {
    width: 700,
    height: 700,
    borderRadius: 350,
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
    maxWidth: 420,
    width: '100%',
  },
  centerStageDesktop: {
    maxWidth: 540,
  },
  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 26,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        filter: 'drop-shadow(0 16px 24px rgba(22, 60, 38, 0.22))',
      },
      default: {
        shadowColor: '#103B23',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  iconWrapperDesktop: {
    width: 140,
    height: 140,
    borderRadius: 32,
    marginBottom: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandBlock: {
    alignItems: 'center',
    width: '100%',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF7F1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(32, 96, 61, 0.18)',
    marginBottom: 10,
  },
  categoryBadgeText: {
    color: '#20603D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#14261C',
    letterSpacing: -0.8,
    marginBottom: 6,
    textAlign: 'center',
    ...Platform.select({
      web: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    }),
  },
  brandTitleDesktop: {
    fontSize: 40,
    letterSpacing: -1.2,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 320,
    ...Platform.select({
      web: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    }),
  },
  brandSubtitleDesktop: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
    marginBottom: 32,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 220,
  },
  progressContainerDesktop: {
    maxWidth: 280,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#20603D',
    borderRadius: 9999,
  },
  progressCaption: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
