import {
  LicenseKey,
  licenseRefreshStateGuard,
  type LicensePayload,
  type LicenseQuota,
  type InstalledLicense,
  installedLicenseGuard,
  resolveLicenseQuota,
} from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { type Optional } from '@silverhand/essentials';
import { type CommonQueryMethods } from '@silverhand/slonik';
import { got } from 'got';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { createSystemsQuery } from '#src/queries/system.js';

import packageJson from '../../package.json' with { type: 'json' };

import { licenseConsoleLog } from './console.js';
import { LicenseVerificationError, verifyLicenseKey } from './verify.js';

/** The license installed on this deployment, once its signature has been verified. */
export type VerifiedLicense = {
  /** The verified claims of the installed key. */
  payload: LicensePayload;
  /** When the key was installed, as an ISO 8601 timestamp. */
  installedAt: string;
  /**
   * What the license entitles this deployment to, with the self-hosted defaults filled in for
   * everything the key does not override.
   */
  quota: LicenseQuota;
  /** The last successful refresh, used as the start of the offline grace period. */
  lastRefreshedAt: string;
  /** The end of the offline grace period. */
  graceEndsAt: string;
  /** The last refusal reason returned by the license service, if any. */
  refusalReason?: string;
};

/**
 * How long a process may answer from its cached license before going back to the database.
 *
 * `invalidate()` only reaches the process that handled the write, so on a deployment running
 * several instances every other one has to notice a change by itself. The same 60 seconds the
 * well-known cache uses: entitlements change rarely, one `systems` row read per process per minute
 * costs nothing, and it bounds how long an instance can serve a license that was replaced or
 * removed elsewhere.
 */
const licenseCacheTtl = 60_000;

/** The reader caches one license, so the key only has to be stable. */
const cacheKey = 'license';

const refreshInterval = 7 * 24 * 60 * 60 * 1000;
const refreshAttemptInterval = 60 * 60 * 1000;
export const licenseGracePeriod = 30 * 24 * 60 * 60 * 1000;

/** The production license service is fixed; development uses the configured Cloud endpoint. */
export const selfHostedLicenseServiceUrl = new URL('https://cloud.logto.io');

const refreshResponseGuard = z.object({ license: z.string().min(1) });
const refreshRefusalGuard = z.object({ reason: z.string().min(1) });

const getLicenseServiceUrl = () =>
  EnvSet.values.isProduction ? selfHostedLicenseServiceUrl : EnvSet.values.cloudUrlSet.endpoint;

const getGraceEndsAt = (lastRefreshedAt: string) =>
  new Date(new Date(lastRefreshedAt).getTime() + licenseGracePeriod).toISOString();

const isOlderThan = (value: string | undefined, age: number) =>
  value === undefined || Date.parse(value) + age <= Date.now();

type RefreshState = z.infer<typeof licenseRefreshStateGuard>;

type RefreshContext = {
  pool: CommonQueryMethods;
  license: VerifiedLicense;
  deploymentId: string;
  refreshState: RefreshState;
  installedJwt: string;
};

/**
 * Reads the license installed on this deployment and verifies it offline.
 *
 * A license is installed into the global `systems` table, so — like `SystemContext` — there is one
 * reader per process rather than one per tenant, and `LicenseReader.shared` is how everything
 * reaches it.
 *
 * The read is lazy and cached: a license can be installed at any time through
 * `PUT /api/systems/license`, which calls `invalidate()` so the next read picks the new key up.
 * That only reaches one process, so the cache also expires on its own — see {@link licenseCacheTtl}.
 *
 * Entitlements are consulted on the request path, so nothing here ever fails a request: a key that
 * no longer verifies drops the deployment back to the self-hosted defaults and is reported, and
 * only the database read itself can throw.
 */
export default class LicenseReader {
  static shared = new LicenseReader();

  /**
   * The in-flight or resolved read, so concurrent requests share one database round trip and one
   * signature verification. Empty means the next read starts a new one.
   */
  readonly #cache = new TtlCache<string, Promise<Optional<VerifiedLicense>>>(licenseCacheTtl);

  /** A refresh is intentionally not awaited by a request, but only one may run per instance. */
  #refreshing?: Promise<void>;

  /**
   * The verified license installed on this deployment, or `undefined` when there is none, it does
   * not verify against the trusted public key, or its claims are not a license payload. Every one
   * of those means the same thing to a caller: the self-hosted defaults apply.
   *
   * @param pool A pool that can reach the global `systems` table, i.e. `EnvSet.sharedPool`. Tenant
   * pools connect as the row-level-security restricted role, which has no privileges on that table.
   * Whichever pool reads first answers every caller until the cache is invalidated or expires.
   */
  async read(pool: CommonQueryMethods): Promise<Optional<VerifiedLicense>> {
    /**
     * Self-hosted plans: an installed license grants nothing until the feature launches, so a
     * production build behaves exactly like today's OSS whatever sits in the `systems` table.
     * Removed together with the other self-hosted plans guards at launch.
     */
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    const cached = this.#cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const reading = this.#read(pool);
    this.#cache.set(cacheKey, reading);

    try {
      return await reading;
    } catch (error: unknown) {
      // A database failure is transient; caching the rejection would keep answering with it.
      if (this.#cache.get(cacheKey) === reading) {
        this.#cache.delete(cacheKey);
      }

      throw error;
    }
  }

  /** Drop the cached license so the next read goes back to the database. */
  invalidate() {
    this.#cache.clear();
  }

  async #read(pool: CommonQueryMethods): Promise<Optional<VerifiedLicense>> {
    const { findSystemByKey } = createSystemsQuery(pool);
    const [record, refreshStateRecord, deploymentIdRecord] = await Promise.all([
      findSystemByKey(LicenseKey.License),
      findSystemByKey(LicenseKey.LicenseRefreshState),
      findSystemByKey(LicenseKey.LicenseDeploymentId),
    ]);

    if (!record) {
      return;
    }

    const installed = installedLicenseGuard.safeParse(record.value);

    if (!installed.success) {
      licenseConsoleLog.error(
        'The installed license is malformed and was ignored. Install the license key again.'
      );

      return;
    }

    return this.#readVerifiedLicense(
      pool,
      installed.data,
      refreshStateRecord ?? undefined,
      deploymentIdRecord ?? undefined
    );
  }

  async #readVerifiedLicense(
    pool: CommonQueryMethods,
    installed: InstalledLicense,
    refreshStateRecord: Record<string, unknown> | undefined,
    deploymentIdRecord: Record<string, unknown> | undefined
  ): Promise<VerifiedLicense | undefined> {
    try {
      const payload = await verifyLicenseKey(installed.jwt);
      const parsedRefreshState = licenseRefreshStateGuard.safeParse(refreshStateRecord?.value);
      const refreshState: RefreshState = parsedRefreshState.success
        ? parsedRefreshState.data
        : { lastRefreshedAt: new Date(payload.iat * 1000).toISOString() };
      const deploymentValue = deploymentIdRecord?.value;
      const deploymentId = typeof deploymentValue === 'string' ? deploymentValue : undefined;
      const { lastRefreshedAt } = refreshState;
      const license = {
        payload,
        installedAt: installed.installedAt,
        quota: resolveLicenseQuota(payload.quota),
        lastRefreshedAt,
        graceEndsAt: getGraceEndsAt(lastRefreshedAt),
        ...(refreshState.refusalReason && { refusalReason: refreshState.refusalReason }),
      };

      // A newly installed key has no attempt timestamp, so the first read registers it immediately.
      const shouldRefresh =
        refreshState.lastAttemptAt === undefined ||
        (isOlderThan(lastRefreshedAt, refreshInterval) &&
          isOlderThan(refreshState.lastAttemptAt, refreshAttemptInterval));

      if (deploymentId && shouldRefresh) {
        this.#startRefresh({
          pool,
          license,
          deploymentId,
          refreshState,
          installedJwt: installed.jwt,
        });
      }

      return license;
    } catch (error: unknown) {
      if (!(error instanceof LicenseVerificationError)) {
        throw error;
      }

      licenseConsoleLog.error(
        `The installed license key could not be verified (${error.code}) and was ignored. The self-hosted defaults apply.`
      );
    }
  }

  #startRefresh(context: RefreshContext) {
    if (this.#refreshing) {
      return;
    }

    const refreshing = this.#refresh(context);
    this.#refreshing = refreshing;
    void this.#clearRefresh(refreshing);
  }

  async #clearRefresh(refreshing: Promise<void>) {
    try {
      await refreshing;
    } finally {
      if (this.#refreshing === refreshing) {
        this.#refreshing = undefined;
      }
    }
  }

  async #refresh({ pool, license, deploymentId, refreshState, installedJwt }: RefreshContext) {
    const { upsertSystem } = createSystemsQuery(pool);
    const lastAttemptAt = new Date().toISOString();

    try {
      await upsertSystem(LicenseKey.LicenseRefreshState, {
        ...refreshState,
        lastAttemptAt,
      });

      const response = await got.post(
        new URL(
          `/api/self-hosted-licenses/${encodeURIComponent(license.payload.licenseId)}/refresh`,
          getLicenseServiceUrl()
        ),
        {
          json: {
            license: installedJwt,
            deploymentId,
            logtoVersion: packageJson.version,
          },
          responseType: 'json',
          throwHttpErrors: false,
        }
      );

      if (response.statusCode === 403) {
        const refusal = refreshRefusalGuard.safeParse(response.body);
        const refusalReason = refusal.success ? refusal.data.reason : 'unknown';

        await upsertSystem(LicenseKey.LicenseRefreshState, {
          ...refreshState,
          lastAttemptAt,
          refusalReason,
        });
        this.invalidate();
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`License refresh failed with status ${response.statusCode}.`);
      }

      const refreshed = refreshResponseGuard.parse(response.body);
      const refreshedPayload = await verifyLicenseKey(refreshed.license);
      const lastRefreshedAt = new Date(refreshedPayload.iat * 1000).toISOString();

      await upsertSystem(LicenseKey.License, {
        jwt: refreshed.license,
        installedAt: license.installedAt,
      });
      await upsertSystem(LicenseKey.LicenseRefreshState, {
        lastRefreshedAt,
        lastAttemptAt,
      });
      this.invalidate();
    } catch (error: unknown) {
      licenseConsoleLog.warn(
        'Unable to refresh the self-hosted license; the current key remains active.',
        error
      );
    }
  }
}
