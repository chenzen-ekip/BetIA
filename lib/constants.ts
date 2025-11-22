// Constantes de l'application

export const COLORS = {
  bg: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    tertiary: '#707070',
  },
  accent: {
    main: '#10a37f',
    hover: '#0d8a6f',
    light: 'rgba(16, 163, 127, 0.1)',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  border: {
    default: '#2a2a2a',
    light: '#3a3a3a',
  },
} as const

export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 400,
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const

export const SPACING = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
} as const


