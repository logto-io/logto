import {
  type BlockchainUserInfo,
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
} from '@logto/connector-kit';
import type { BlockchainConnectorPayload } from '@logto/schemas';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

export const verifyBlockchainIdentity = async (
  { connectorId, address, signature }: BlockchainConnectorPayload,
  ctx: WithLogContext,
  { connectors }: TenantContext
): Promise<BlockchainUserInfo> => {
  const { getLogtoConnectorById } = connectors;

  const connector = await getLogtoConnectorById(connectorId);

  assertThat(connector.type === ConnectorType.Blockchain, 'connector.unexpected_type');

  const log = ctx.createLog('Interaction.SignIn.Identifier.Blockchain.Submit');
  log.append({ connectorId, address, signature });

  // TODO: @lbennett use real nonce
  const recovered = await connector.verifyMessage('wow', signature);

  if (recovered !== address) {
    throw new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid);
  }

  const userInfo = { address };

  log.append(userInfo);

  return userInfo;
};
