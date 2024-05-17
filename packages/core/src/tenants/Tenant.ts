import { adminTenantId, experience } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import Koa from 'koa';
import compose from 'koa-compose';
import koaCompress from 'koa-compress';
import mount from 'koa-mount';
import type Provider from 'oidc-provider';

import { type CacheStore } from '#src/caches/types.js';
import { WellKnownCache } from '#src/caches/well-known.js';
import { AdminApps, EnvSet, UserApps } from '#src/env-set/index.js';
import { createCloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { createConnectorLibrary } from '#src/libraries/connector.js';
import { createLogtoConfigLibrary } from '#src/libraries/logto-config.js';
import koaAutoConsent from '#src/middleware/koa-auto-consent.js';
import koaConnectorErrorHandler from '#src/middleware/koa-connector-error-handler.js';
import koaConsoleRedirectProxy from '#src/middleware/koa-console-redirect-proxy.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import koaOidcErrorHandler from '#src/middleware/koa-oidc-error-handler.js';
import koaSecurityHeaders from '#src/middleware/koa-security-headers.js';
import koaSlonikErrorHandler from '#src/middleware/koa-slonik-error-handler.js';
import koaSpaProxy from '#src/middleware/koa-spa-proxy.js';
import koaSpaSessionGuard from '#src/middleware/koa-spa-session-guard.js';
import initOidc from '#src/oidc/init.js';
import { mountCallbackRouter } from '#src/routes/callback.js';
import initApis from '#src/routes/init.js';
import initMeApis from '#src/routes-me/init.js';
import BasicSentinel from '#src/sentinel/basic-sentinel.js';

import Libraries from './Libraries.js';
import Queries from './Queries.js';
import type TenantContext from './TenantContext.js';
import { getTenantDatabaseDsn } from './utils.js';

/** Data for creating a tenant instance. */
type CreateTenant = {
  /** The unique identifier of the tenant. */
  id: string;
  /** The cache store for the tenant. */
  redisCache: CacheStore;
  /** The custom domain of the tenant, if applicable. */
  customDomain?: string;
};

export default class Tenant implements TenantContext {
  static async create({ id, redisCache, customDomain }: CreateTenant): Promise<Tenant> {
    // Treat the default database URL as the management URL
    const envSet = new EnvSet(id, await getTenantDatabaseDsn(id));
    // Custom endpoint is used for building OIDC issuer URL when the request is a custom domain
    await envSet.load(customDomain);

    return new Tenant(envSet, id, new WellKnownCache(id, redisCache));
  }

  public readonly provider: Provider;
  public readonly run: MiddlewareType;

  private readonly app: Koa;

  readonly #createdAt = Date.now();
  #requestCount = 0;
  #onRequestEmpty?: () => Promise<void>;

  // eslint-disable-next-line max-params
  private constructor(
    public readonly envSet: EnvSet,
    public readonly id: string,
    public readonly wellKnownCache: WellKnownCache,
    public readonly queries = new Queries(envSet.pool, wellKnownCache),
    public readonly logtoConfigs = createLogtoConfigLibrary(queries),
    public readonly cloudConnection = createCloudConnectionLibrary(logtoConfigs),
    public readonly connectors = createConnectorLibrary(queries, cloudConnection),
    public readonly libraries = new Libraries(
      id,
      queries,
      connectors,
      cloudConnection,
      logtoConfigs
    ),
    public readonly sentinel = new BasicSentinel(envSet.pool)
  ) {
    const isAdminTenant = id === adminTenantId;
    const mountedApps = [
      ...Object.values(UserApps),
      ...(isAdminTenant ? Object.values(AdminApps) : []),
    ];

    this.envSet = envSet;

    // Init app
    const app = new Koa();

    app.use(koaErrorHandler());
    app.use(koaOidcErrorHandler());
    app.use(koaSlonikErrorHandler());
    app.use(koaConnectorErrorHandler());
    app.use(koaI18next());
    app.use(koaCompress());
    app.use(koaSecurityHeaders(mountedApps, id));

    // Mount OIDC
    const provider = initOidc(envSet, queries, libraries, logtoConfigs, cloudConnection);
    app.use(mount('/oidc', provider.app));

    const tenantContext: TenantContext = {
      id,
      provider,
      queries,
      logtoConfigs,
      cloudConnection,
      connectors,
      libraries,
      envSet,
      sentinel,
      invalidateCache: this.invalidateCache.bind(this),
    };

    // Sign-in experience callback via form submission
    mountCallbackRouter(app);

    // Mount APIs
    app.use(mount('/api', initApis(tenantContext)));

    const { isMultiTenancy } = EnvSet.values;

    // Mount admin tenant APIs and app
    if (id === adminTenantId) {
      // Mount `/me` APIs for admin tenant
      app.use(mount('/me', initMeApis(tenantContext)));

      // Mount Admin Console when needed
      // Skip in multi-tenancy mode since Logto Cloud serves Admin Console in this case
      if (!isMultiTenancy) {
        app.use(koaConsoleRedirectProxy(queries));
        app.use(
          mount(
            '/' + AdminApps.Console,
            koaSpaProxy(mountedApps, AdminApps.Console, 5002, AdminApps.Console)
          )
        );
      }
    }

    // In OSS, no need for mounting demo app in the admin tenant since it may cause confusion
    // while distinguishing "demo app from admin tenant" and "demo app from user tenant";
    // on the cloud, we need to configure admin tenant sign-in experience, so a preview is needed for
    // testing without signing out of the admin console.
    if (id !== adminTenantId || isMultiTenancy) {
      // Mount demo app
      app.use(
        mount(
          '/' + UserApps.DemoApp,
          koaSpaProxy(mountedApps, UserApps.DemoApp, 5003, UserApps.DemoApp)
        )
      );
    }

    // Mount UI
    app.use(
      compose([
        koaSpaSessionGuard(provider, queries),
        mount(`/${experience.routes.consent}`, koaAutoConsent(provider, queries)),
        koaSpaProxy(mountedApps),
      ])
    );

    this.app = app;
    this.provider = provider;

    const { isPathBasedMultiTenancy, adminUrlSet } = EnvSet.values;

    this.run =
      isPathBasedMultiTenancy &&
      // If admin URL Set is specified, consider that URL first
      !(adminUrlSet.deduplicated().length > 0 && this.id === adminTenantId)
        ? mount('/' + this.id, this.app)
        : mount(this.app);
  }

  public requestStart() {
    this.#requestCount += 1;
  }

  public requestEnd() {
    if (this.#requestCount > 0) {
      this.#requestCount -= 1;

      if (this.#requestCount === 0) {
        void this.#onRequestEmpty?.();
      }
    }
  }

  /**
   * Try to dispose the tenant resources. If there are any pending requests, this function will wait for them to end with 5s timeout.
   *
   * Currently this function only ends the database pool.
   *
   * @returns Resolves `true` for a normal disposal and `'timeout'` for a timeout.
   */
  public async dispose() {
    if (this.#requestCount <= 0) {
      await this.envSet.end();

      return true;
    }

    return new Promise<true | 'timeout'>((resolve) => {
      const timeout = setTimeout(async () => {
        this.#onRequestEmpty = undefined;
        await this.envSet.end();
        resolve('timeout');
      }, 5000);

      this.#onRequestEmpty = async () => {
        clearTimeout(timeout);
        await this.envSet.end();
        resolve(true);
      };
    });
  }

  /**
   * Set a expiration timestamp in redis cache, and check it before returning the tenant LRU cache. This helps
   * determine when to invalidate the cached tenant and force a in-place rolling reload of the OIDC provider.
   */
  public async invalidateCache() {
    await this.wellKnownCache.set('tenant-cache-expires-at', WellKnownCache.defaultKey, Date.now());
  }

  /**
   * Check if the tenant cache is healthy by comparing its creation timestamp with the global expiration timestamp.
   *
   * The global tenant expiration timestamp is stored in redis and shared across all server cluster instances. It
   * can be set by calling `invalidateCache()` method on any tenant instance.
   *
   * @returns Resolves `true` if the tenant cache is healthy, `false` if it should be invalidated.
   */
  public async checkHealth() {
    // `tenant-cache-expires-at` is a timestamp set in redis, which indicates all existing tenant instances in LRU
    // cache should be invalidated after this timestamp, effective for the entire server cluster.
    const tenantCacheExpiresAt = await this.wellKnownCache.get(
      'tenant-cache-expires-at',
      WellKnownCache.defaultKey
    );

    // Healthy if there's no expiration timestamp, or the current LRU cached tenant instance is created after the
    // expiration timestamp.
    return !tenantCacheExpiresAt || tenantCacheExpiresAt < this.#createdAt;
  }
}
