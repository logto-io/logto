import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module
const config: Config.InitialOptions = merge(require('jest-puppeteer/jest-preset'));

export default config;
