/**
 * Design tokens — TS mirror of src/styles/tokens.css for the 3D scene
 * (shader uniforms, materials). Values must byte-match the CSS custom
 * properties; update both files together.
 */
export const COLORS = {
  bgVoid: '#0A0A0B',
  bgSurface: '#141417',
  bgElevated: '#1B1B1F',
  line: '#26262B',
  textHi: '#EDEDE6',
  textMid: '#A5A59C',
  textLow: '#6E6E67',
  amber: '#FF8C1A',
  amberHot: '#FFB84D',
  amberWhite: '#FFE7C2',
  ember: '#C2410C',
} as const;

export type ColorToken = keyof typeof COLORS;
