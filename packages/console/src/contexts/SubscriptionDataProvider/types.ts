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

export type SubscriptionUsageOptions<T extends keyof NewSubscriptionCountBasedUsage> = {
  quotaKey: T;
  subscriptionUsage: NewSubscriptionCountBasedUsage;
  subscriptionQuota: NewSubscriptionQuota;
  usage?: NewSubscriptionCountBasedUsage[T];
};

type NewSubscriptionSupplementContext = {
  logtoSkus: LogtoSkuResponse[];
  currentSku: LogtoSkuResponse;
  currentSubscriptionQuota: NewSubscriptionQuota;
  currentSubscriptionBasicQuota: NewSubscriptionQuota;
  currentSubscriptionUsage: NewSubscriptionCountBasedUsage;
  currentSubscriptionResourceScopeUsage: NewSubscriptionResourceScopeUsage;
  currentSubscriptionRoleScopeUsage: NewSubscriptionRoleScopeUsage;
  mutateSubscriptionQuotaAndUsages: () => void;
};

type NewSubscriptionResourceStatus = {
  hasSurpassedSubscriptionQuotaLimit: <T extends keyof NewSubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: NewSubscriptionCountBasedUsage[T]
  ) => boolean;
  hasReachedSubscriptionQuotaLimit: <T extends keyof NewSubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: NewSubscriptionCountBasedUsage[T]
  ) => boolean;
};

export type NewSubscriptionContext = Context & NewSubscriptionSupplementContext;

export type FullContext = Context &
  NewSubscriptionSupplementContext &
  NewSubscriptionResourceStatus;
