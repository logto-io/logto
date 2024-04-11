import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import outputSize from 'rollup-plugin-output-size';

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
      nodeResolve({ exportConditions: ['node'], preferBuiltins: true }),
      commonjs(),
      json(),
      outputSize(),
    ],
  },
];

export default configs;
