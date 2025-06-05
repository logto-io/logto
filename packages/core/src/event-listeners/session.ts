import { type Session } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

export const deleteSessionExtensions = async (
  { oidcSessionExtensions }: Queries,
  session: Session
) => {
  const { uid } = session;

  await oidcSessionExtensions.deleteBySessionUid(uid);
};
