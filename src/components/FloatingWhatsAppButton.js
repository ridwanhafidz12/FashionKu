/**
 * @file FloatingWhatsAppButton.js
 * @description Floating WhatsApp chat button with smooth spring scale hover animation,
 * glowing shadow, and direct redirection to WhatsApp: 6281973612917.
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const WHATSAPP_PHONE = '6281973612917';
const WHATSAPP_MESSAGE =
  'Halo Admin FashionKu, saya ingin konsultasi mengenai produk & pesanan busana.';

export default function FloatingWhatsAppButton({
  phone = WHATSAPP_PHONE,
  message = WHATSAPP_MESSAGE,
  bottomOffset,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isHovered, setIsHovered] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.18,
        friction: 5,
        tension: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(tooltipAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(tooltipAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      friction: 4,
      tension: 120,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.18 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url).catch((err) => {
        console.warn('Gagal membuka WhatsApp:', err);
      });
    }
  };

  const calculatedBottom =
    typeof bottomOffset === 'number'
      ? bottomOffset
      : isDesktop
      ? 28
      : 84;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: calculatedBottom,
          right: isDesktop ? 28 : 18,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Tooltip on Desktop hover */}
      {isDesktop && (
        <Animated.View
          style={[
            styles.tooltipWrap,
            {
              opacity: tooltipAnim,
              transform: [
                {
                  translateX: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>Chat WhatsApp Admin</Text>
            <View style={styles.onlineDot} />
          </View>
        </Animated.View>
      )}

      {/* WhatsApp Circular Button */}
      <Pressable
        onPress={handleClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel="Chat WhatsApp Admin FashionKu"
      >
        <Animated.View
          style={[
            styles.circleButton,
            isHovered && styles.circleButtonHovered,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <FontAwesome name="whatsapp" size={34} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  pressable: {
    ...Platform.select({
      web: {
        cursor: 'pointer',
        outline: 'none',
      },
    }),
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
        transition: 'box-shadow 0.25s ease',
      },
    }),
  },
  circleButtonHovered: {
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 32px rgba(37, 211, 102, 0.70)',
      },
    }),
  },
  tooltipWrap: {
    marginRight: 10,
  },
  tooltipBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
      },
    }),
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
});
