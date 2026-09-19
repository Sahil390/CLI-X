export function writeMachine(data: unknown, pretty = true) {
  console.log(pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}
export function writeHuman(msg: string) {
  // Always stderr so stdout stays pure for pipes
  console.error(msg);
}
