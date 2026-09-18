import ora, { Ora } from 'ora';

export function createSpinner(text: string): Ora {
  return ora(text).start();
}

export function stopWithSuccess(spinner: Ora, text: string): void {
  spinner.succeed(text);
}

export function stopWithFailure(spinner: Ora, text: string): void {
  spinner.fail(text);
}

export function stopWithInfo(spinner: Ora, text: string): void {
  spinner.stopAndPersist({ text, symbol: 'ℹ' });
}
