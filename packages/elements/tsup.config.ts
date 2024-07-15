import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  format: 'esm',
  dts: true,
  clean: true,
});
