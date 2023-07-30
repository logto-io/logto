import { Buffer } from 'buffer/';

if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    (window as any).Buffer = Buffer as any;
  }
  if (!window.global) {
    window.global = window;
  }
  if (!window.process) {
    (window as any).process = { env: {} };
  }
}
