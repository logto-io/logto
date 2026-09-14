import {
  LicenseKey,
  type LicensePayload,
  type LicenseQuota,
  installedLicenseGuard,
  resolveLicenseQuota,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { EnvSet } from '#src/env-set/index.js';
import { createSystemsQuery } from '#src/queries/system.js';

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
 *
 * Entitlements are consulted on the request path, so nothing here ever fails a request: a key that
 * no longer verifies drops the deployment back to the self-hosted defaults and is reported, and
 * only the database read itself can throw.
 */
export default class LicenseReader {
  static shared = new LicenseReader();

  /**
   * The in-flight or resolved read, so concurrent requests share one database round trip and one
   * signature verification. `undefined` means the next read starts a new one.
   */
  #cache: Optional<Promise<Optional<VerifiedLicense>>>;

  /**
   * The verified license installed on this deployment, or `undefined` when there is none, it does
   * not verify against the trusted public key, or its claims are not a license payload. Every one
   * of those means the same thing to a caller: the self-hosted defaults apply.
   *
   * @param pool Any pool for the Logto database. The `systems` table is global, so whichever pool
   * reads first answers every caller until the cache is invalidated.
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

    const cached = this.#cache;

    if (cached) {
      return cached;
    }

    const reading = this.#read(pool);
    this.#cache = reading;

    // A database failure is transient; caching the rejection would keep answering with it.
    return reading.catch((error: unknown) => {
      if (this.#cache === reading) {
        this.#cache = undefined;
      }

      throw error;
    });
  }

  /** Drop the cached license so the next read goes back to the database. */
  invalidate() {
    this.#cache = undefined;
  }

  async #read(pool: CommonQueryMethods): Promise<Optional<VerifiedLicense>> {
    const { findSystemByKey } = createSystemsQuery(pool);
    const record = await findSystemByKey(LicenseKey.License);

    if (!record) {
      return;
    }

    const installed = installedLicenseGuard.safeParse(record.value);

    if (!installed.success) {
      licenseConsoleLog.error(
        'The installed license is malformed and was ignored. Install the license key again from Logto Cloud.'
      );

      return;
    }

    try {
      const payload = await verifyLicenseKey(installed.data.jwt);

      return {
        payload,
        installedAt: installed.data.installedAt,
        quota: resolveLicenseQuota(payload.quota),
      };
    } catch (error: unknown) {
      if (!(error instanceof LicenseVerificationError)) {
        throw error;
      }

      licenseConsoleLog.error(
        `The installed license key could not be verified (${error.code}) and was ignored. The self-hosted defaults apply.`
      );

      return;
    }
  }
}
