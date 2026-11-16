/**
 * @file BottomTabs.js
 * @description Custom bottom navigation bar with spring pop animations
 * and haptic feedback on tab switches.
 */

import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabs } from '../data/appData';
import { colors, shadows } from '../theme/colors';

/** Trigger light haptic impact if expo-haptics is installed. */
function triggerHapticFeedback() {
  try {
    const Haptics = require('expo-haptics');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
  } catch {
    // expo-haptics not installed or not supported on platform — ignore safely
  }
}

const TAB_ICONS_ALT = {
  home: { feather: 'home' },
  explore: { feather: 'search' },
  quiz: { feather: 'zap' },
  orders: { feather: 'package' },
  profile: { feather: 'user' },
};

export default function BottomTabs({ active, onChange }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 768;

  // On desktop web, navigation is handled in the professional Top Navigation Bar (like Shopee / Tokopedia)
  if (isDesktop) {
    return null;
  }

  // Scale animations per tab
  const scales = useRef(
    Object.fromEntries(tabs.map((tab) => [tab.id, new Animated.Value(tab.id === 'home' ? 1 : 1)]))
  ).current;

  const handlePress = (tabId) => {
    if (tabId === active) return;

    // Light tactile feedback when switching tabs.
    triggerHapticFeedback();

    onChange(tabId);

    // Pop animation on the pressed tab icon.
    Animated.sequence([
      Animated.spring(scales[tabId], {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.spring(scales[tabId], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
    ]).start();
  };

  return (
    <View
      style={[
        styles.tabs,
        isDesktop
          ? [styles.tabsDesktop, { left: desktopLeft, width: desktopTabWidth, bottom: 20 }]
          : [styles.tabsMobile, { height: 72 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }],
      ]}
    >
      {/* Frosted top border only on mobile */}
      {!isDesktop && <View style={styles.topBorder} />}

      {tabs.map((tab) => {
        const selected = active === tab.id;
        const isCenter = tab.id === 'quiz';
        const iconColor = selected ? colors.forest : '#757575';

        return (
          <Pressable
            key={tab.id}
            style={styles.tabButton}
            onPress={() => handlePress(tab.id)}
            hitSlop={6}
          >
            {/* Center floating button */}
            {isCenter ? (
              <Animated.View
                style={[
                  styles.centerIcon,
                  selected && styles.centerIconActive,
                  { transform: [{ scale: scales[tab.id] }] },
                ]}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={24}
                  color="#FFFFFF"
                />
              </Animated.View>
            ) : (
              <>
                <Animated.View
                  style={[
                    styles.icon,
                    selected && styles.iconActive,
                    { transform: [{ scale: scales[tab.id] }] },
                  ]}
                >
                  {tab.id === 'impact' ? (
                    <MaterialCommunityIcons name="leaf" size={20} color={iconColor} />
                  ) : (
                    <Feather name={tab.icon} size={20} color={iconColor} />
                  )}
                </Animated.View>
                <Text
                  style={[
                    styles.label,
                    selected && styles.labelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </>
            )}

            {/* Center label under floating button */}
            {isCenter && (
              <Text style={[styles.label, selected && styles.labelActive, styles.centerLabel]}>
                {tab.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: 'absolute',
    paddingTop: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    zIndex: 100,
  },
  tabsMobile: {
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ivory,
    ...shadows.lg,
  },
  tabsDesktop: {
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(20,61,96,0.12)',
    height: 70,
    paddingBottom: 8,
    ...shadows.xl,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingTop: 2,
  },
  icon: {
    width: 38,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: '#EDF7EE',
  },
  // ─── Center AI Stylist tab ─────────────────────────────────────────────────
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    marginTop: -28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.md,
  },
  centerIconActive: {
    backgroundColor: colors.forestMid,
    borderColor: '#FFFFFF',
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  centerLabel: {
    marginTop: 2,
  },
  // ─── Labels ───────────────────────────────────────────────────────────────
  label: {
    color: '#757575',
    fontSize: 9.5,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.forest,
    fontWeight: '800',
  },
});
