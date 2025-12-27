// Sahara Sense Soft Desert Palette
// Inspired by calm desert mornings and professional elegance

export const colors = {
  // Primary Soft Palette - From your design
  primary: {
    sky: '#93B5C6',      // Soft blue-grey (sky)
    mist: '#C9CCD5',     // Light grey-blue (mist)
    sand: '#E4D8DC',     // Soft pink-grey (sand)
    blush: '#FFE3E3',    // Light pink (blush)
  },

  // Accent - Warm amber for CTAs
  accent: {
    50: '#FFF8F0',
    100: '#FFEFD9',
    200: '#FFD9A8',
    300: '#FFC277',
    400: '#FFAB46',
    500: '#D4A574',      // Main amber
    600: '#B8935F',
    700: '#A85F00',
    800: '#8B4F00',
    900: '#6E3F00',
  },

  // Neutral - Soft grays
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },

  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#93B5C6',     // Using primary sky color
  },

  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #F5F5F4 0%, #FFE3E3 50%, #E4D8DC 100%)',
    soft: 'linear-gradient(135deg, #93B5C6 0%, #C9CCD5 50%, #E4D8DC 100%)',
    amber: 'linear-gradient(135deg, #D4A574 0%, #B8935F 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%)',
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 40px rgba(212, 165, 116, 0.3)',
  glass: '0 8px 32px 0 rgba(147, 181, 198, 0.15)',
};

export const blur = {
  sm: 'blur(4px)',
  md: 'blur(8px)',
  lg: 'blur(16px)',
  xl: 'blur(24px)',
};
