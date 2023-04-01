import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { summary } from 'rollup-plugin-summary';

/**
 * @type {import('rollup').RollupOptions}
 */
const configs = [
  {
    input: ['src/index.ts'],
    output: [{ dir: 'lib' }],
    external: ['zod', 'got', '@logto/connector-kit'],
    plugins: [
      typescript({ tsconfig: 'tsconfig.build.json' }),
      nodeResolve(),
      commonjs(),
      json(),
      summary(),
    ],
  },
];

export default configs;
