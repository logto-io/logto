import { spawn } from 'node:child_process';

const pnpmArgs = [
  '-r',
  '--parallel',
  '--filter',
  '!@logto/integration-tests',
  '--filter',
  '!./packages/connectors/connector-*',
  'dev',
];

const isWindows = process.platform === 'win32';

// On Windows, pnpm is typically a .cmd shim which can't be spawned directly via CreateProcess;
// run it through cmd.exe instead.
const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'pnpm';
const args = isWindows ? ['/d', '/s', '/c', 'pnpm', ...pnpmArgs] : pnpmArgs;

const child = spawn(command, args, { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (typeof code === 'number') {
    process.exit(code);
  }
  process.exit(signal ? 1 : 0);
});
