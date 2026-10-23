import { type LogtoEnterpriseResponse } from '@/cloud/types/router';

export type UserSubscriptionsOutletContext = {
  /** Console SSO creation uses only the first Enterprise; never list other contracts. */
  readonly enterprise?: LogtoEnterpriseResponse;
};
