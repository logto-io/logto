import { mergeConfig, type UserConfig } from 'vite';

import { defaultConfig } from '../../vite.shared.config';

const config: UserConfig = {
  base: '/demo-app',
  server: {
    port: 5003,
    hmr: {
      port: 6003,
    },
  },
};

export default mergeConfig(defaultConfig, config);
