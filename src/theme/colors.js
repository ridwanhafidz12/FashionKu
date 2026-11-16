// ─── CIRCULAI Design Token System ───────────────────────────────────────────
// Palette Warna Hijau: Mindaro (#DDEB9D), Pistachio (#A0C878), Ming (#27667B), Indigo Dye (#143D60)

export const colors = {
  // Exact Palette Tokens
  mindaro: '#DDEB9D',      // Soft pastel lime green
  pistachio: '#A0C878',    // Primary fresh pistachio green
  ming: '#27667B',         // Deep petroleum teal green
  indigoDye: '#143D60',    // Deep indigo dark navy

  // Core brand aliases mapped to palette
  forest: '#2C6842',       // Main brand green — Darker Green
  forestLight: '#A0C878',  // Light highlight — Pistachio
  forestMid: '#1C4A2E',    // Deep green accent
  forestDark: '#143D60',   // Deep dark background — Indigo Dye

  // Accent & Soft Tints
  sand: '#DDEB9D',         // Soft Mindaro accent
  sandLight: '#F4F8E5',    // Very soft Mindaro background tint
  sandDark: '#C7D985',     // Deeper Mindaro shade
  terracotta: '#27667B',   // Harmonized accent — Ming
  terracottaLight: '#39849E',

  // Neutrals - Ultra Clean Modern E-Commerce Backgrounds
  ivory: '#F5F6F8',        // Clean neutral light gray (Tokopedia/Shopee/Blibli benchmark)
  ivoryDark: '#EBF0EB',    // Subtle soft tint
  charcoal: '#111827',     // Deep crisp black-gray for maximum HD text readability
  charcoalMid: '#1E293B',  // Slate 800
  warmGray: '#64748B',     // Slate 500 for secondary text
  warmGrayLight: '#94A3B8',// Slate 400
  lightGray: '#E2E8F0',    // Slate 200 for clean razor-thin borders
  lightGrayDark: '#CBD5E1',// Slate 300
  white: '#FFFFFF',
  offWhite: '#FAFAFA',

  // Semantic
  success: '#2C6842',
  successLight: '#E8F5E3',    // Light mint — proper background for green text
  warning: '#D99A3D',
  warningLight: '#FDF4E3',
  error: '#C94C4C',
  errorLight: '#FDEDED',
  info: '#27667B',
  infoLight: '#E6F0F4',

  // Shopee Signature Design System Tokens
  shopeeOrange: '#EE4D2D',      // Iconic Shopee Orange
  shopeeOrangeLight: '#FF5722',
  shopeeOrangeDark: '#D73211',
  shopeeOrangeBg: '#FFF5F1',
  shopeeYellow: '#FFE97D',      // Discount sticker yellow
  shopeeRed: '#D0011B',         // Shopee Mall red
  shopeeBg: '#F5F5F5',          // Authentic Shopee desktop & app canvas background
  shopeeBorder: '#E8E8E8',
  shopeeGreen: '#00BFA5',       // Gratis Ongkir XTRA turquoise
  shopeeBlue: '#0088FF',

  // Overlay
  overlay: 'rgba(20,61,96,0.48)',
  overlayLight: 'rgba(20,61,96,0.20)',
  overlayDark: 'rgba(20,61,96,0.70)',

  // Alpha / Transparent variants
  forestAlpha6: 'rgba(160,200,120,0.08)',
  forestAlpha9: 'rgba(160,200,120,0.12)',
  forestAlpha15: 'rgba(160,200,120,0.18)',
  forestAlpha20: 'rgba(160,200,120,0.25)',
};

// ─── Shadow System (Refined Multi-Layer Soft Shadows from Reference Design) ───
export const shadows = {
  xs: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
  },
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    boxShadow: '0 2px 4px rgba(16, 24, 40, 0.05)',
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    boxShadow: '0 4px 12px -2px rgba(16, 24, 40, 0.07), 0 2px 4px -2px rgba(16, 24, 40, 0.03)',
  },
  lg: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    boxShadow: '0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
  },
  xl: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    elevation: 10,
    boxShadow: '0 20px 36px -4px rgba(16, 24, 40, 0.10), 0 6px 12px -2px rgba(16, 24, 40, 0.04)',
  },
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 6,
    boxShadow: '0 16px 32px -4px rgba(16, 24, 40, 0.06), 0 4px 8px -2px rgba(16, 24, 40, 0.02)',
  },
  // Colored shadow for primary CTA buttons
  forest: {
    shadowColor: '#2C6842',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
    boxShadow: '0 8px 24px rgba(44, 104, 66, 0.28)',
  },
};

// ─── Legacy alias for backward compatibility ──────────────────────────────────
export const cardShadow = shadows.md;

// ─── Border Radius Scale ──────────────────────────────────────────────────────
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 36,
  full: 9999,
};

// ─── Color Semantic Aliases ───────────────────────────────────────────────────
export const palette = {
  primary: colors.forest,
  primaryLight: colors.forestLight,
  primaryDark: colors.forestDark,
  surface: colors.white,
  surfaceAlt: colors.ivory,
  surfaceSand: colors.sand,
  border: colors.lightGray,
  borderStrong: colors.lightGrayDark,
  text: colors.charcoal,
  textSecondary: colors.warmGray,
  textMuted: colors.warmGrayLight,
  textInverse: colors.white,
  accent: colors.terracotta,
};
