import {
  type LogtoSkuResponse,
  type Subscription,
  type NewSubscriptionQuota,
  type NewSubscriptionCountBasedUsage,
  type NewSubscriptionResourceScopeUsage,
  type NewSubscriptionRoleScopeUsage,
} from '@/cloud/types/router';

export type Context = {
  currentSubscription: Subscription;
  onCurrentSubscriptionUpdated: (subscription?: Subscription) => void;
};

type NewSubscriptionSupplementContext = {
  logtoSkus: LogtoSkuResponse[];
  currentSku: LogtoSkuResponse;
  currentSubscriptionQuota: NewSubscriptionQuota;
  currentSubscriptionUsage: NewSubscriptionCountBasedUsage;
  currentSubscriptionResourceScopeUsage: NewSubscriptionResourceScopeUsage;
  currentSubscriptionRoleScopeUsage: NewSubscriptionRoleScopeUsage;
  mutateSubscriptionQuotaAndUsages: () => void;
};

export type NewSubscriptionContext = Context & NewSubscriptionSupplementContext;

export type FullContext = Context & NewSubscriptionSupplementContext;
