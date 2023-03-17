import { GlobalValues } from '@logto/shared';

export const EnvSet = {
  global: new GlobalValues(),

  get isProduction() {
    return this.global.isProduction;
  },
};
