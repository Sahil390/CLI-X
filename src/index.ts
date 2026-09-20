import { createCli } from './cli/index';

// ============================================================
// CLI-X — Entry Point
// Bootstrap: creates CLI and parses argv.
// ============================================================

const cli = createCli();
cli.parse(process.argv);
