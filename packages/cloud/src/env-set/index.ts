const getEnv = (key: string) => process.env[key];

class GlobalValues {
  public readonly logtoEndpoint = new URL(getEnv('ADMIN_ENDPOINT') ?? 'http://localhost:3002');

  public readonly dbUrl = getEnv('DB_URL');
  public readonly isProduction = getEnv('NODE_ENV') === 'production';
}

export const EnvSet = {
  global: new GlobalValues(),

  get isProduction() {
    return this.global.isProduction;
  },
};
