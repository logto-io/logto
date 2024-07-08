import type Provider from 'oidc-provider';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';
import certificateThumbprint from 'oidc-provider/lib/helpers/certificate_thumbprint.js';
import epochTime from 'oidc-provider/lib/helpers/epoch_time.js';
import dpopValidate from 'oidc-provider/lib/helpers/validate_dpop.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import assertThat from '#src/utils/assert-that.js';

const { InvalidGrant, InvalidClient } = errors;

/**
 * Handle DPoP bound access tokens.
 */
export const handleDPoP = async (
  ctx: KoaContextWithOIDC,
  token: InstanceType<Provider['AccessToken']> | InstanceType<Provider['ClientCredentials']>,
  originalToken?: InstanceType<Provider['RefreshToken']>
) => {
  const { client } = ctx.oidc;
  assertThat(client, new InvalidClient('client must be available'));

  const dPoP = await dpopValidate(ctx);

  if (dPoP) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unique: unknown = await ReplayDetection.unique(
      client.clientId,
      dPoP.jti,
      epochTime() + 300
    );

    assertThat(unique, new InvalidGrant('DPoP proof JWT Replay detected'));

    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('jkt', dPoP.thumbprint);
  } else if (client.dpopBoundAccessTokens) {
    throw new InvalidGrant('DPoP proof JWT not provided');
  }

  if (originalToken?.jkt && (!dPoP || originalToken.jkt !== dPoP.thumbprint)) {
    throw new InvalidGrant('failed jkt verification');
  }
};

/**
 * Handle client certificate bound access tokens.
 */
export const handleClientCertificate = async (
  ctx: KoaContextWithOIDC,
  token: InstanceType<Provider['AccessToken']> | InstanceType<Provider['ClientCredentials']>,
  originalToken?: InstanceType<Provider['RefreshToken']>
) => {
  const { client, provider } = ctx.oidc;
  assertThat(client, new InvalidClient('client must be available'));

  const providerInstance = instance(provider);
  const {
    features: {
      mTLS: { getCertificate },
    },
  } = providerInstance.configuration();

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (client.tlsClientCertificateBoundAccessTokens || originalToken?.['x5t#S256']) {
    const cert = getCertificate(ctx);

    if (!cert) {
      throw new InvalidGrant('mutual TLS client certificate not provided');
    }
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('x5t', cert);

    if (originalToken?.['x5t#S256'] && originalToken['x5t#S256'] !== certificateThumbprint(cert)) {
      throw new InvalidGrant('failed x5t#S256 verification');
    }
  }
};
