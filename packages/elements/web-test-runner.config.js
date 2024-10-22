import { fileURLToPath } from 'node:url';

import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const config = {
  files: ['src/**/*.test.ts'],
  nodeResolve: {
    exportConditions: ['development'],
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('tsconfig.json', import.meta.url)),
    }),
    // Transform SVG files into Lit templates
    {
      name: 'transform-svg',
      transform(context) {
        if (context.path.endsWith('.svg')) {
          return {
            body: `import { html } from 'lit';\nexport default html\`${context.body}\`;`,
            headers: { 'content-type': 'application/javascript' },
          };
        }
      },
    },
  ],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testFramework: {
    config: {
      ui: 'tdd',
      timeout: 5000,
    },
  },
  coverageConfig: {
    include: ['src/**/*.ts'],
  },
};

export default config;
