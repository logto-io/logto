import { tryThat } from '@logto/shared';
import { assertEnv, getEnv, getEnvAsStringArray } from '@silverhand/essentials';

import UrlSet from './UrlSet.js';
import { isTrue } from './parameters.js';
import { throwErrorWithDsnMessage } from './throw-errors.js';

const developmentTenantIdKey = 'DEVELOPMENT_TENANT_ID';

type MultiTenancyMode = 'domain' | 'env';

export default class GlobalValues {
  public readonly isProduction = getEnv('NODE_ENV') === 'production';
  public readonly isTest = getEnv('NODE_ENV') === 'test';
  public readonly isIntegrationTest = isTrue(getEnv('INTEGRATION_TEST'));

  public readonly httpsCert = process.env.HTTPS_CERT_PATH;
  public readonly httpsKey = process.env.HTTPS_KEY_PATH;
  public readonly isHttpsEnabled = Boolean(this.httpsCert && this.httpsKey);

  public readonly urlSet = new UrlSet(this.isHttpsEnabled, 3001);
  public readonly adminUrlSet = new UrlSet(this.isHttpsEnabled, 3002, 'ADMIN_');

  public readonly isDomainBasedMultiTenancy = this.urlSet.endpoint.includes('*');

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
}
