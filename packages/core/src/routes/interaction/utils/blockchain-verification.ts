import type { BlockchainUserInfo } from '@logto/connector-kit';
import type { BlockchainConnectorPayload } from '@logto/schemas';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';

export const verifyBlockchainIdentity = async (
  { connectorId, address, signature }: BlockchainConnectorPayload,
  ctx: WithLogContext,
  { provider, libraries }: TenantContext
): Promise<BlockchainUserInfo> => {
  // Const {
  //   socials: { getUserInfoByAuthCode },
  // } = libraries;

  const log = ctx.createLog('Interaction.SignIn.Identifier.Blockchain.Submit');
  log.append({ connectorId, address, signature });

  const userInfo = { address };

  log.append(userInfo);

  return userInfo;
};
