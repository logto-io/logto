import net from 'net';

import { tryThat } from '@logto/shared';
import { assertEnv, deduplicate, getEnv, getEnvAsStringArray } from '@silverhand/essentials';

import { isTrue } from './parameters.js';
import { throwErrorWithDsnMessage } from './throw-errors.js';

const enableMultiTenancyKey = 'ENABLE_MULTI_TENANCY';
const developmentTenantIdKey = 'DEVELOPMENT_TENANT_ID';

type MultiTenancyMode = 'domain' | 'env';

export class UrlSet {
  public readonly port = Number(getEnv(this.envPrefix + 'PORT') || this.defaultPort);
  public readonly localhostUrl = `${this.isHttpsEnabled ? 'https' : 'http'}://localhost:${
    this.port
  }`;

  public readonly endpoint = getEnv(this.envPrefix + 'ENDPOINT', this.localhostUrl);

  constructor(
    public readonly isHttpsEnabled: boolean,
    protected readonly defaultPort: number,
    protected readonly envPrefix: string = ''
  ) {}

  public deduplicated(): string[] {
    return deduplicate([this.localhostUrl, this.endpoint]);
  }
}

export default class GlobalValues {
  public readonly isProduction = getEnv('NODE_ENV') === 'production';
  public readonly isTest = getEnv('NODE_ENV') === 'test';
  public readonly isIntegrationTest = isTrue(getEnv('INTEGRATION_TEST'));

  public readonly httpsCert = process.env.HTTPS_CERT_PATH;
  public readonly httpsKey = process.env.HTTPS_KEY_PATH;
  public readonly isHttpsEnabled = Boolean(this.httpsCert && this.httpsKey);

  public readonly isMultiTenancy = isTrue(getEnv(enableMultiTenancyKey));

  public readonly urlSet = new UrlSet(this.isHttpsEnabled, 3001);
  public readonly adminUrlSet = new UrlSet(this.isHttpsEnabled, 3002, 'ADMIN_');

  // eslint-disable-next-line unicorn/consistent-function-scoping
  public readonly databaseUrl = tryThat(() => assertEnv('DB_URL'), throwErrorWithDsnMessage);
  public readonly developmentTenantId = getEnv(developmentTenantIdKey);
  public readonly userDefaultRoleNames = getEnvAsStringArray('USER_DEFAULT_ROLE_NAMES');
  public readonly developmentUserId = getEnv('DEVELOPMENT_USER_ID');
  public readonly trustProxyHeader = isTrue(getEnv('TRUST_PROXY_HEADER'));
  public readonly ignoreConnectorVersionCheck = isTrue(getEnv('IGNORE_CONNECTOR_VERSION_CHECK'));

  public get dbUrl(): string {
    return this.databaseUrl;
  }

  public get endpoint(): string {
    return this.urlSet.endpoint;
  }

  public get multiTenancyMode(): MultiTenancyMode {
    const { hostname } = new URL(this.endpoint);

    return this.isMultiTenancy && !net.isIP(hostname) && hostname !== 'localhost'
      ? 'domain'
      : 'env';
  }
}
