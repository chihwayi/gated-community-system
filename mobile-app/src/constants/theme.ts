export const COLORS = {
  // Backgrounds
  background: '#0f172a', // Slate 900
  surface: '#1e293b',    // Slate 800
  surfaceHighlight: '#334155', // Slate 700
  
  // Primary / Accents
  primary: '#06b6d4',    // Cyan 500
  secondary: '#2563eb',  // Blue 600
  accent: '#8b5cf6',     // Violet 500
  
  // Status
  success: '#10b981',    // Emerald 500
  warning: '#f59e0b',    // Amber 500
  error: '#ef4444',      // Red 500
  info: '#3b82f6',       // Blue 500
  
  // Text
  textPrimary: '#f8fafc', // Slate 50
  textSecondary: '#94a3b8', // Slate 400
  textMuted: '#64748b',   // Slate 500
  border: 'rgba(255,255,255,0.1)',

  // Gradients
  gradientPrimary: ['#06b6d4', '#2563eb'] as const,
  gradientDark: ['#0f172a', '#1e293b'] as const,
  gradientGlass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const,
};

export const SPACING = {
  xs: 4,
  s: 8,
  sm: 8,
  m: 16,
  md: 16,
  l: 24,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  s: 8,
  sm: 8,
  m: 12,
  md: 12,
  l: 16,
  lg: 16,
  xl: 24,
  full: 9999,
};
