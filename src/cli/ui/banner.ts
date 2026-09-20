import { colors } from './colors';

// ============================================================
// CLI-X — ASCII Banner
// Stylized block-letter banner rendered in neon purple.
// ============================================================

const BANNER_LINES = [
  '  ██████╗██╗      ██╗    ██╗  ██╗',
  ' ██╔════╝██║      ██║    ╚██╗██╔╝',
  ' ██║     ██║      ██║     ╚███╔╝ ',
  ' ██║     ██║      ██║     ██╔██╗ ',
  ' ╚██████╗███████╗ ██║    ██╔╝ ██╗',
  '  ╚═════╝╚══════╝ ╚═╝    ╚═╝  ╚═╝',
];

const SUBTITLE = 'AI-Native CLI Development Agent';
const VERSION  = 'v0.1.0';

/** Renders the styled CLI-X banner with subtitle. */
export function renderBanner(): string {
  const bannerText = BANNER_LINES.map((line) => colors.boldPurple(line)).join('\n');
  const subtitleText = colors.boldCyan(`  ${SUBTITLE}`);
  const versionText  = colors.dim(`  ${VERSION}`);
  const divider      = colors.dim('  ' + '─'.repeat(42));

  return [
    '',
    bannerText,
    '',
    subtitleText,
    versionText,
    divider,
    '',
  ].join('\n');
}

/** Renders a compact one-line brand header for command output. */
export function renderInlineBrand(): string {
  return `${colors.boldPurple('CLI-X')} ${colors.dim('|')} ${colors.cyan(SUBTITLE)}`;
}
