import { colors } from './colors';

// ============================================================
// CLI-X — Structured Logger
// Consistent symbol-based output matching terminal UI spec:
//
//  ◆  Step / info       (cyan)
//  ●  Listening/status  (green)
//  ✓  Success           (bright green)
//  ✕  Error             (red)
//  ★  Warning/action    (yellow)
//  →  Action direction  (yellow)
// ============================================================

export const ui = {
  /** ◆ Informational step (cyan) */
  info(message: string): void {
    console.log(`${colors.boldCyan('◆')} ${message}`);
  },

  /** ● Listening / active status (green) */
  listen(message: string): void {
    console.log(`${colors.boldGreen('●')} ${message}`);
  },

  /** ✓ Success confirmation (bright green) */
  success(message: string): void {
    console.log(`${colors.boldGreen('✓')} ${message}`);
  },

  /** ✕ Error notification (red) */
  error(message: string): void {
    console.log(`${colors.boldRed('✕')} ${colors.red('Error:')} ${message}`);
  },

  /** ★ Warning / dynamic action (yellow) */
  warning(message: string): void {
    console.log(`${colors.boldYellow('★')} ${message}`);
  },

  /** → Directional action step (yellow) */
  action(message: string): void {
    console.log(`${colors.yellow('→')} ${message}`);
  },

  /** Prints a section header in bold purple */
  header(message: string): void {
    console.log(`\n${colors.boldPurple(message)}`);
  },

  /** Horizontal separator line in dim cyan */
  separator(): void {
    console.log(colors.dim('  ' + '─'.repeat(42)));
  },

  /** Plain dim text (for secondary information) */
  muted(message: string): void {
    console.log(colors.dim(`  ${message}`));
  },

  /** A labeled key-value pair */
  field(key: string, value: string): void {
    const padded = key.padEnd(12);
    console.log(`  ${colors.cyan(padded)} ${colors.white(value)}`);
  },

  /** Blank line */
  blank(): void {
    console.log('');
  },

  /** Raw print (pass-through) */
  print(message: string): void {
    console.log(message);
  },
};

/** Alias for backward compatibility */
export const logger = ui;
