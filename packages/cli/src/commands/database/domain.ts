import path from 'node:path';

import {
  type CloudflareData,
  DomainStatus,
  CloudflareKey,
  hostnameProviderDataGuard,
  cloudflareDataGuard,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import chalk from 'chalk';
import { got } from 'got';
import type { CommandModule } from 'yargs';
import { z } from 'zod';

import { createPoolFromConfig } from '../../database.js';
import {
  findAllDomainsAcrossTenants,
  updateDomainStatusById,
  deleteDomainById,
} from '../../queries/domain.js';
import { getRowByKey } from '../../queries/system.js';
import { consoleLog } from '../../utils.js';

const cloudflareBaseUrl = new URL('https://api.cloudflare.com/client/v4');

const cloudflareResponseGuard = z.object({
  success: z.boolean(),
  result: z.unknown(),
});

type CloudflareAuth = { zoneId: string; apiToken: string };

const buildCloudflareHostnameUrl = (auth: CloudflareAuth, identifier: string) =>
  new URL(
    path.join(cloudflareBaseUrl.pathname, `/zones/${auth.zoneId}/custom_hostnames/${identifier}`),
    cloudflareBaseUrl
  );

const getDomainStatusFromCloudflareData = (data: CloudflareData): DomainStatus => {
  switch (data.status) {
    case 'active': {
      return data.ssl.status === 'active' ? DomainStatus.Active : DomainStatus.PendingSsl;
    }
    default: {
      return DomainStatus.PendingVerification;
    }
  }
};

const getCloudflareHostname = async (auth: CloudflareAuth, identifier: string) => {
  const response = await got.get(buildCloudflareHostnameUrl(auth, identifier), {
    headers: { Authorization: `Bearer ${auth.apiToken}` },
    throwHttpErrors: false,
  });

  if (!response.ok) {
    return { ok: false as const, statusCode: response.statusCode };
  }

  const parsed = cloudflareResponseGuard.safeParse(JSON.parse(response.body));
  if (!parsed.success || !parsed.data.success) {
    return { ok: false as const, statusCode: response.statusCode };
  }

  const result = cloudflareDataGuard.safeParse(parsed.data.result);
  if (!result.success) {
    return { ok: false as const, statusCode: response.statusCode };
  }

  return { ok: true as const, data: result.data };
};

const deleteCloudflareHostname = async (auth: CloudflareAuth, identifier: string) => {
  const response = await got.delete(buildCloudflareHostnameUrl(auth, identifier), {
    headers: { Authorization: `Bearer ${auth.apiToken}` },
    throwHttpErrors: false,
  });

  // 404 means already deleted, which is fine
  if (response.statusCode === 404) {
    return { ok: true as const, alreadyGone: true };
  }

  if (!response.ok) {
    return { ok: false as const, statusCode: response.statusCode };
  }

  return { ok: true as const, alreadyGone: false };
};

const sleep = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const syncDomainFromCloudflare = async (
  pool: Awaited<ReturnType<typeof createPoolFromConfig>>,
  auth: CloudflareAuth,
  domain: Awaited<ReturnType<typeof findAllDomainsAcrossTenants>>[number]
): Promise<'synced' | 'skipped' | 'error'> => {
  if (!domain.cloudflareData?.id) {
    consoleLog.warn(
      `  ${chalk.yellow('SKIP')} ${domain.domain} (tenant: ${domain.tenantId}) — no cloudflare_data`
    );
    return 'skipped';
  }

  await sleep(100);

  const result = await getCloudflareHostname(auth, domain.cloudflareData.id);

  if (!result.ok) {
    if (result.statusCode === 404) {
      consoleLog.warn(
        `  ${chalk.red('NOT_FOUND')} ${domain.domain} (tenant: ${domain.tenantId}) — not found in Cloudflare`
      );
      await updateDomainStatusById({
        pool,
        id: domain.id,
        status: DomainStatus.Error,
        errorMessage: 'Custom hostname not found in Cloudflare',
        cloudflareData: domain.cloudflareData,
      });
      return 'error';
    }

    if (result.statusCode === 401) {
      consoleLog.fatal(
        'Cloudflare API authentication failed. Check the apiToken in hostname provider config.'
      );
    }

    consoleLog.warn(
      `  ${chalk.red('ERROR')} ${domain.domain} — Cloudflare API error ${result.statusCode}`
    );
    return 'error';
  }

  const newStatus = getDomainStatusFromCloudflareData(result.data);
  const {
    verification_errors: verificationErrors,
    ssl: { validation_errors: sslErrors },
  } = result.data;
  const errorMessage = [
    ...(verificationErrors ?? []),
    ...(sslErrors ?? []).map(({ message }) => message),
  ]
    .filter(Boolean)
    .join('\n');

  await updateDomainStatusById({
    pool,
    id: domain.id,
    status: newStatus,
    errorMessage,
    cloudflareData: result.data,
  });
  return 'synced';
};

const cleanupStaleDomain = async (
  pool: Awaited<ReturnType<typeof createPoolFromConfig>>,
  auth: CloudflareAuth,
  domain: Awaited<ReturnType<typeof findAllDomainsAcrossTenants>>[number]
): Promise<boolean> => {
  if (domain.cloudflareData?.id) {
    await sleep(100);

    const result = await deleteCloudflareHostname(auth, domain.cloudflareData.id);

    if (!result.ok) {
      consoleLog.warn(
        `  ${chalk.red('CF_ERROR')} ${domain.domain} — failed to delete from Cloudflare (${result.statusCode}), skipping`
      );
      return false;
    }

    if (result.alreadyGone) {
      consoleLog.info(
        `  ${chalk.gray('CF_GONE')} ${domain.domain} — already deleted in Cloudflare`
      );
    } else {
      consoleLog.info(`  ${chalk.green('CF_DEL')} ${domain.domain} — deleted from Cloudflare`);
    }
  }

  await deleteDomainById(pool, domain.id);
  consoleLog.info(
    `  ${chalk.green('DB_DEL')} ${domain.domain} (tenant: ${domain.tenantId}) — deleted from database`
  );
  return true;
};

const printReport = (
  updatedDomains: Awaited<ReturnType<typeof findAllDomainsAcrossTenants>>,
  staleDays: number
) => {
  const active = updatedDomains.filter((entry) => entry.status === DomainStatus.Active);
  const pending = updatedDomains.filter(
    (entry) =>
      entry.status === DomainStatus.PendingVerification || entry.status === DomainStatus.PendingSsl
  );
  const errored = updatedDomains.filter((entry) => entry.status === DomainStatus.Error);

  const staleThreshold = new Date();
  staleThreshold.setDate(staleThreshold.getDate() - staleDays);

  const staleDomains = updatedDomains.filter(
    (entry) => entry.status !== DomainStatus.Active && new Date(entry.createdAt) < staleThreshold
  );

  consoleLog.info('');
  consoleLog.info(`  ${chalk.green('Active')}: ${active.length}`);
  consoleLog.info(`  ${chalk.yellow('Pending')}: ${pending.length}`);
  consoleLog.info(`  ${chalk.red('Error')}: ${errored.length}`);
  consoleLog.info(
    `  ${chalk.magenta('Stale')} (non-active, >${staleDays} days): ${staleDomains.length}`
  );

  if (staleDomains.length > 0) {
    consoleLog.info('');
    consoleLog.info('Stale domains:');
    for (const entry of staleDomains) {
      consoleLog.info(
        `  - ${entry.domain} (tenant: ${entry.tenantId}, status: ${entry.status}, created: ${entry.createdAt})`
      );
    }
  }

  return staleDomains;
};

const sync: CommandModule<unknown, { cleanup: boolean; 'stale-days': number }> = {
  command: 'sync',
  describe: 'Sync custom domain statuses from Cloudflare and optionally clean up stale domains',
  builder: (yargs) =>
    yargs
      .option('cleanup', {
        describe: 'Delete stale domains from both Cloudflare and database',
        type: 'boolean',
        default: false,
      })
      .option('stale-days', {
        describe: 'Number of days after which a non-active domain is considered stale',
        type: 'number',
        default: 14,
      }),
  handler: async ({ cleanup, 'stale-days': staleDays }) => {
    const pool = await createPoolFromConfig();

    // Load Cloudflare hostname provider config from systems table
    const configRow = await getRowByKey(pool, CloudflareKey.HostnameProvider);
    if (!configRow) {
      consoleLog.fatal('Cloudflare hostname provider is not configured in the systems table.');
    }

    const configResult = hostnameProviderDataGuard.safeParse(configRow.value);
    if (!configResult.success) {
      consoleLog.fatal('Invalid hostname provider config:', configResult.error.message);
    }

    const auth = configResult.data;

    // Fetch all domains across all tenants
    const domains = await findAllDomainsAcrossTenants(pool);
    consoleLog.info(`Found ${chalk.bold(domains.length)} domains across all tenants`);

    if (domains.length === 0) {
      consoleLog.succeed('No domains to process.');
      await pool.end();
      return;
    }

    // Phase 1: Sync domain statuses from Cloudflare
    consoleLog.info('Syncing domain statuses from Cloudflare...');
    const syncResults = [];
    for (const entry of domains) {
      // eslint-disable-next-line no-await-in-loop
      const result = await syncDomainFromCloudflare(pool, auth, entry);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      syncResults.push(result);
    }

    const syncedCount = syncResults.filter((result) => result === 'synced').length;
    const syncErrorCount = syncResults.filter((result) => result === 'error').length;
    consoleLog.info(`Sync complete: ${syncedCount} updated, ${syncErrorCount} errors`);

    // Re-fetch domains with updated statuses for reporting
    const updatedDomains = await findAllDomainsAcrossTenants(pool);
    const staleDomains = printReport(updatedDomains, staleDays);

    // Phase 2: Cleanup stale domains (if flag is set)
    if (!cleanup) {
      if (staleDomains.length > 0) {
        consoleLog.info('');
        consoleLog.info(`Run with ${chalk.bold('--cleanup')} to delete these stale domains.`);
      }
      await pool.end();
      return;
    }

    if (staleDomains.length === 0) {
      consoleLog.succeed('No stale domains to clean up.');
      await pool.end();
      return;
    }

    consoleLog.info('');
    consoleLog.info(`Cleaning up ${staleDomains.length} stale domains...`);

    const cleanupResults = [];
    for (const entry of staleDomains) {
      // eslint-disable-next-line no-await-in-loop
      const success = await cleanupStaleDomain(pool, auth, entry);
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      cleanupResults.push(success);
    }

    const deletedCount = cleanupResults.filter(Boolean).length;
    const deleteErrorCount = cleanupResults.filter((result) => !result).length;

    consoleLog.info('');
    consoleLog.succeed(`Cleanup complete: ${deletedCount} deleted, ${deleteErrorCount} errors`);

    await pool.end();
  },
};

const domain: CommandModule = {
  command: ['domain'],
  describe: 'Commands for Logto custom domain management',
  builder: (yargs) => yargs.command(sync).demandCommand(1),
  handler: noop,
};

export default domain;
