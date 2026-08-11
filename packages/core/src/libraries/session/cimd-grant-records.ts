import { conditional, trySafe } from '@silverhand/essentials';
import type { Context } from 'koa';
import { errors, type Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

/** The snapshot's `name varchar(256)` bound — truncate rather than fail the consent. */
const snapshotNameMaxLength = 256;

/** The snapshot's `logo_uri varchar(2048)` bound — a truncated URL is useless, so null instead. */
const snapshotLogoUriMaxLength = 2048;

/**
 * PostgreSQL `varchar(n)` counts code points — a UTF-16 `slice` could split a surrogate pair
 * into a lone `�`.
 */
const truncateToCodePoints = (value: string, maxLength: number) =>
  Array.from(value).slice(0, maxLength).join('');

/**
 * The client snapshot rides every CIMD consent: the grant list renders it instead of
 * refetching the rewritable document, and its existence marks the grant as CIMD. The
 * organization binding precedes it so a rejected submission leaves no snapshot, and must hold
 * exactly the submitted organization — the conflict-ignored insert cannot tell a
 * same-organization retry from a different organization landing on the grant, and the read
 * fails closed when the row was cascade-deleted in between. No-ops for a non-CIMD client.
 */
export const saveCimdGrantRecords = async (
  ctx: Context,
  provider: Provider,
  queries: Queries,
  {
    grantId,
    cimdClientId,
    organizationId,
    userId,
    freshGrant,
  }: {
    grantId: string;
    cimdClientId?: string;
    organizationId?: string;
    userId: string;
    /**
     * The grant this consent just saved — destroyed on a failed write, since an orphan
     * carrying the snapshot marker would surface in the grant list. Best effort: a failed
     * cleanup is logged and the write error stays the surfaced failure.
     */
    freshGrant?: { destroy: () => Promise<void> };
  }
) => {
  if (!cimdClientId) {
    return;
  }

  try {
    if (organizationId) {
      await queries.cimd.grantOrganizations.insert({ grantId, organizationId, userId });
      const organizationIds = await queries.cimd.grantOrganizations.findOrganizationIds(grantId);
      assertThat(
        organizationIds.length === 1 && organizationIds[0] === organizationId,
        new errors.InvalidRequest(
          'the grant organization binding does not match the submitted organization'
        )
      );
    }

    const client = await provider.Client.find(cimdClientId);
    assertThat(client, new errors.InvalidClient('client must be available'));

    const { clientName, logoUri } = client;

    /** The insert builder maps an explicitly-undefined field to SQL null. */
    await queries.cimd.grantClientSnapshots.insert({
      grantId,
      clientId: cimdClientId,
      name: conditional(clientName && truncateToCodePoints(clientName, snapshotNameMaxLength)),
      logoUri: conditional(
        logoUri && Array.from(logoUri).length <= snapshotLogoUriMaxLength && logoUri
      ),
    });
  } catch (error: unknown) {
    if (freshGrant) {
      await trySafe(
        async () => freshGrant.destroy(),
        (destroyError) => {
          getConsoleLogFromContext(ctx).warn(
            'Failed to destroy the grant after a failed cimd record write:',
            destroyError
          );
        }
      );
    }

    throw error;
  }
};
