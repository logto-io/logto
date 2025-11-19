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
  /**
   * Quota checking function with business rules applied.
   *
   * This function wraps the pure calculation utilities from SubscriptionDataProvider/utils
   * and applies plan-specific enforcement policies (e.g., Development plan unlimited features).
   * Backend still enforces actual limits; this function only controls UI behavior.
   */
  hasSurpassedSubscriptionQuotaLimit: <T extends keyof NewSubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: NewSubscriptionCountBasedUsage[T]
  ) => boolean;
  /**
   * Quota checking function with business rules applied.
   *
   * This function wraps the pure calculation utilities from SubscriptionDataProvider/utils
   * and applies plan-specific enforcement policies (e.g., Development plan unlimited features).
   * Backend still enforces actual limits; this function only controls UI behavior.
   */
  hasReachedSubscriptionQuotaLimit: <T extends keyof NewSubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: NewSubscriptionCountBasedUsage[T]
  ) => boolean;
};

export type NewSubscriptionContext = Context & NewSubscriptionSupplementContext;

export type FullContext = Context &
  NewSubscriptionSupplementContext &
  NewSubscriptionResourceStatus;
