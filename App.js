/**
 * @file App.js
 * @description Application entry point for FashionKu.
 *
 * Manages the top-level phase state (splash → onboarding → main) and
 * configures the Android navigation bar colour to match the app theme.
 */

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainApp from './src/navigation/MainApp';
import { AppProvider } from './src/state/AppContext';
import { colors } from './src/theme/colors';

const ONBOARDING_KEY = '@fashionku/has_completed_onboarding';

export default function App() {
  const [phase, setPhase] = useState('splash');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const onboardingCompletedRef = React.useRef(false);
  const backgroundColor = colors.ivory;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((val) => {
        if (val === 'true') {
          onboardingCompletedRef.current = true;
          setHasCompletedOnboarding(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setPositionAsync('relative').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
    NavigationBar.setBackgroundColorAsync(colors.ivory).catch(() => {});
    NavigationBar.setBorderColorAsync(colors.lightGray).catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'FashionKu — Ekosistem Busana & Penjahit Lokal';
      const styleId = 'fashionku-web-global-styles';
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

        /* ─── Premium SAAS Typography Architecture (Reference Design) ─── */
        html {
          scroll-behavior: smooth;
        }

        body, #root, [data-testid="root"], button, input, optgroup, select, textarea {
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
          letter-spacing: -0.012em;
        }

        /* ─── Subtle Ambient Background Aura (Reference Design System) ─── */
        body::after {
          content: "";
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 10% 20%, rgba(44, 104, 66, 0.035) 0%, rgba(160, 200, 120, 0.015) 40%, transparent 70%);
          z-index: -1;
          pointer-events: none;
        }

        /* ─── Seamless Inputs (No Ugly Black Box / Outline) ─── */
        input, textarea, select {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
        }

        /* ─── Interactive Micro-Interactions (Reference Design) ─── */
        button, [role="button"] {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, filter 0.15s ease;
        }

        /* ─── Sleek Precision Scrollbars ─── */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `;
    }
  }, []);

  const handleSplashDone = async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (val === 'true' || onboardingCompletedRef.current || hasCompletedOnboarding) {
        setPhase('main');
        return;
      }
    } catch {
      // Fallback to ref or state
    }
    if (onboardingCompletedRef.current || hasCompletedOnboarding) {
      setPhase('main');
    } else {
      setPhase('onboarding');
    }
  };

  const handleOnboardingDone = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
    onboardingCompletedRef.current = true;
    setHasCompletedOnboarding(true);
    setPhase('main');
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.root, { backgroundColor }]}
          edges={phase === 'main' ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
        >
          <StatusBar
            style="dark"
            backgroundColor={backgroundColor}
            translucent={false}
          />

          <AppProvider>
            {phase === 'splash' && <SplashScreen onDone={handleSplashDone} />}
            {phase === 'onboarding' && <OnboardingScreen onDone={handleOnboardingDone} />}
            {phase === 'main' && <MainApp />}
          </AppProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory,
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: {
        minHeight: '100vh',
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      },
    }),
  },
});
