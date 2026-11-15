import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const LOGO = require('../../assets/images/logo_app.png');

export default function SplashScreen({ onDone }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Logo
  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Tagline & dots
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Decorative leaves
  const leafL1 = useRef(new Animated.Value(0)).current;
  const leafL2 = useRef(new Animated.Value(0)).current;
  const leafR1 = useRef(new Animated.Value(0)).current;
  const leafR2 = useRef(new Animated.Value(0)).current;

  // Animated dots (3 dots pulsing in sequence)
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dot4 = useRef(new Animated.Value(0.1)).current;

  // Wave Y position (slides up)
  const waveY = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    // ─── 1. Wave slides up
    Animated.timing(waveY, {
      toValue: 0,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // ─── 2. Logo pop in
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 7,
          bounciness: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ─── 3. Leaves float in
    const leafAnim = (anim, delay) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]);

    Animated.parallel([
      leafAnim(leafL1, 350),
      leafAnim(leafR2, 450),
      leafAnim(leafL2, 600),
      leafAnim(leafR1, 700),
    ]).start();

    // ─── 4. Text fade in
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // ─── 5. Dots pulse loop
    const pulseDot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ])
      );

    const d1 = pulseDot(dot1, 0);
    const d2 = pulseDot(dot2, 180);
    const d3 = pulseDot(dot3, 360);
    const d4 = pulseDot(dot4, 540);

    d1.start(); d2.start(); d3.start(); d4.start();

    // ─── Auto-dismiss
    const timer = setTimeout(onDone, 2400);
    return () => {
      clearTimeout(timer);
      d1.stop(); d2.stop(); d3.stop(); d4.stop();
    };
  }, [onDone]);

  return (
    <View style={styles.container}>
      {/* ── Center Brand Stage ── */}
      <View style={styles.brandStage}>
        {/* Decorative rings */}
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />

        {/* Floating leaves */}
        <Animated.View
          style={[
            styles.leaf,
            styles.leafL1,
            {
              opacity: leafL1,
              transform: [
                { translateY: Animated.multiply(leafL1, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
                { rotate: '-30deg' },
              ],
            },
          ]}
        >
          <LeafSVG size={34} color="#A0C878" opacity={0.85} />
        </Animated.View>

        <Animated.View
          style={[
            styles.leaf,
            styles.leafL2,
            {
              opacity: leafL2,
              transform: [
                { translateY: Animated.multiply(leafL2, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
                { rotate: '-15deg' },
              ],
            },
          ]}
        >
          <LeafSVG size={22} color="#2C6842" opacity={0.65} />
        </Animated.View>

        <Animated.View
          style={[
            styles.leaf,
            styles.leafR1,
            {
              opacity: leafR1,
              transform: [
                { translateY: Animated.multiply(leafR1, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
                { rotate: '20deg' },
              ],
            },
          ]}
        >
          <LeafSVG size={26} color="#2C6842" opacity={0.7} />
        </Animated.View>

        <Animated.View
          style={[
            styles.leaf,
            styles.leafR2,
            {
              opacity: leafR2,
              transform: [
                { translateY: Animated.multiply(leafR2, -1).interpolate({ inputRange: [-1, 0], outputRange: [20, 0] }) },
                { rotate: '40deg' },
              ],
            },
          ]}
        >
          <LeafSVG size={38} color="#A0C878" opacity={0.8} />
        </Animated.View>

        {/* Logo image */}
        <Animated.Image
          source={LOGO}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />

        {/* Loading dots + tagline */}
        <Animated.View style={[styles.bottomContent, { opacity: textOpacity }]}>
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, styles.dotActive, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, styles.dotMid,  { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, styles.dotMid,  { opacity: dot3 }]} />
            <Animated.View style={[styles.dot, { opacity: dot4 }]} />
          </View>
          <Text style={styles.loadingText}>Memuat pengalaman terbaik...</Text>
        </Animated.View>
      </View>

      {/* ── Wave bottom (Full screen edge-to-edge) ── */}
      <Animated.View
        style={[styles.waveContainer, { transform: [{ translateY: waveY }] }]}
        pointerEvents="none"
      >
        <View style={styles.waveGreen} />
        <View style={styles.waveBlue} />
      </Animated.View>
    </View>
  );
}

// ─── Leaf SVG (simple leaf shape drawn with border-radius) ────────────────────
function LeafSVG({ size, color, opacity }) {
  return (
    <View
      style={{
        width: size,
        height: size * 1.3,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.9,
        borderTopRightRadius: size * 0.1,
        borderBottomLeftRadius: size * 0.1,
        borderBottomRightRadius: size * 0.9,
        opacity,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  },

  brandStage: {
    width: 320,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },

  // ── Decorative rings ──────────────────────────────────────────────────────
  ringOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(160,200,120,0.22)',
    borderStyle: 'dashed',
  },
  ringInner: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(160,200,120,0.16)',
    borderStyle: 'dashed',
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    width: 210,
    height: 210,
    marginBottom: 8,
  },

  // ── Leaves ────────────────────────────────────────────────────────────────
  leaf: {
    position: 'absolute',
  },
  leafL1: { left: -16, top: 40 },
  leafL2: { left: -10, top: 190 },
  leafR1: { right: -12, top: 180 },
  leafR2: { right: -20, top: 30 },

  // ── Bottom content ────────────────────────────────────────────────────────
  bottomContent: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
    backgroundColor: 'rgba(160,200,120,0.4)',
  },
  dotActive: {
    width: 9,
    height: 9,
    backgroundColor: '#2C6842',
  },
  dotMid: {
    backgroundColor: '#A0C878',
  },
  loadingText: {
    fontSize: 13,
    color: '#6A7D87',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // ── Wave (Full-width edge-to-edge) ─────────────────────────────────────────
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 150,
    overflow: 'hidden',
    zIndex: 1,
  },
  waveGreen: {
    position: 'absolute',
    bottom: 0,
    left: '-8%',
    right: '-8%',
    height: 110,
    backgroundColor: '#A0C878',
    borderTopLeftRadius: 800,
    borderTopRightRadius: 600,
    opacity: 0.55,
  },
  waveBlue: {
    position: 'absolute',
    bottom: 0,
    left: '-5%',
    right: '-12%',
    height: 80,
    backgroundColor: '#27667B',
    borderTopLeftRadius: 650,
    borderTopRightRadius: 900,
    opacity: 0.45,
  },
});
