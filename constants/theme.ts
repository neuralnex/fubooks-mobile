/**
 * Amazon-inspired theme colors
 * Primary: Amazon Orange (#FF9900)
 * Secondary: Amazon Dark Blue (#232F3E)
 * Accent: Amazon Blue (#146EB4)
 */

import { Platform } from 'react-native';

const tintColorLight = '#FF9900'; // Amazon Orange
const tintColorDark = '#FFB84D'; // Slightly warmer orange in dark mode

export const Colors = {
  light: {
    text: '#131921', // Amazon dark text
    background: '#EAEDED', // Amazon light grey page background
    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
    primary: '#FF9900', // Amazon Orange
    secondary: '#232F3E', // Amazon Dark Blue
    accent: '#0073E6', // Brighter Amazon Blue
    success: '#008A00', // Amazon Green
    error: '#B12704', // Amazon Red
    border: '#DDDDDD',
    cardBackground: '#FFFFFF',
    inputBackground: '#F5F7FA',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0F1111', // Amazon deep dark background
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: tintColorDark,
    primary: '#FFB84D', // Softer orange for dark mode
    secondary: '#232F3E', // Amazon Dark Blue
    accent: '#3EA6FF', // Vibrant blue accent
    success: '#00C853',
    error: '#FF6B6B',
    border: '#3A4551',
    cardBackground: '#1A1F2E',
    inputBackground: '#232F3E',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
