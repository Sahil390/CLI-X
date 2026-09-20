import chalk from 'chalk';

// ============================================================
// CLI-X — Color Palette
// Neon-accented design system using chalk hex colors.
// ============================================================

export const colors = {
  // Primary brand
  purple: (s: string) => chalk.hex('#8B5CF6')(s),
  purpleBright: (s: string) => chalk.hex('#A78BFA')(s),
  purpleDim: (s: string) => chalk.hex('#6D28D9')(s),

  // Status colors
  green: (s: string) => chalk.hex('#00FF66')(s),
  greenMuted: (s: string) => chalk.hex('#10B981')(s),
  cyan: (s: string) => chalk.hex('#22D3EE')(s),
  cyanDim: (s: string) => chalk.hex('#0891B2')(s),
  yellow: (s: string) => chalk.hex('#FBBF24')(s),
  red: (s: string) => chalk.hex('#EF4444')(s),
  redDim: (s: string) => chalk.hex('#DC2626')(s),

  // Neutrals
  white: (s: string) => chalk.white(s),
  gray: (s: string) => chalk.gray(s),
  dim: (s: string) => chalk.dim(s),
  bold: (s: string) => chalk.bold(s),

  // Composite helpers
  boldPurple: (s: string) => chalk.bold.hex('#8B5CF6')(s),
  boldGreen: (s: string) => chalk.bold.hex('#00FF66')(s),
  boldCyan: (s: string) => chalk.bold.hex('#22D3EE')(s),
  boldYellow: (s: string) => chalk.bold.hex('#FBBF24')(s),
  boldRed: (s: string) => chalk.bold.hex('#EF4444')(s),
};

export type ColorKey = keyof typeof colors;
