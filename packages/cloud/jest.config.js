import baseConfig from '@silverhand/jest-config';

/** @type {import('jest').Config} */
const config = { ...baseConfig, roots: ['./build'] };
export default config;
