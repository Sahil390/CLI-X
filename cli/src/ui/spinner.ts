import ora, { Ora } from 'ora';
const IS_TTY = Boolean(process.stderr.isTTY) && !(process.env.NO_COLOR || process.env.FORCE_COLOR === '0');
export function createSpinner(text: string): Ora {
  if (!IS_TTY) {
    // Non-interactive: silent spinner, only emit final state to stderr
    const silent = { start:()=>silent, succeed:(t?:string)=>{console.error(t||text);return silent}, fail:(t?:string)=>{console.error(t||text);return silent}, stop:()=>silent, stopAndPersist:()=>silent, text, isSpinning:false } as unknown as Ora;
    return silent.start();
  }
  return ora({ text, stream: process.stderr }).start();
}
export function stopWithSuccess(s: Ora, text?: string): void { s.succeed(text||''); }
export function stopWithFailure(s: Ora, text?: string): void { s.fail(text||''); }
export function stopWithInfo(s: Ora, text?: string): void { s.stopAndPersist({ text: text||'', symbol: 'ℹ' }); }
