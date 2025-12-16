import {
  type LogtoSkuResponse,
  type Subscription,
  type SubscriptionQuota,
  type SubscriptionCountBasedUsage,
  type SubscriptionResourceScopeUsage,
  type SubscriptionRoleScopeUsage,
} from '@/cloud/types/router';

type BaseContext = {
  currentSubscription: Subscription;
  onCurrentSubscriptionUpdated: (subscription?: Subscription) => void;
};

export type SubscriptionUsageOptions<T extends keyof SubscriptionCountBasedUsage> = {
  quotaKey: T;
  subscriptionUsage: SubscriptionCountBasedUsage;
  subscriptionQuota: SubscriptionQuota;
  usage?: SubscriptionCountBasedUsage[T];
};

type SubscriptionSupplementContext = {
  logtoSkus: LogtoSkuResponse[];
  currentSku: LogtoSkuResponse;
  currentSubscriptionQuota: SubscriptionQuota;
  currentSubscriptionBasicQuota: SubscriptionQuota;
  currentSubscriptionUsage: SubscriptionCountBasedUsage;
  currentSubscriptionResourceScopeUsage: SubscriptionResourceScopeUsage;
  currentSubscriptionRoleScopeUsage: SubscriptionRoleScopeUsage;
  mutateSubscriptionQuotaAndUsages: () => void;
};

type SubscriptionResourceStatus = {
  /**
   * Quota checking function with business rules applied.
   *
   * This function wraps the pure calculation utilities from SubscriptionDataProvider/utils
   * and applies plan-specific enforcement policies (e.g., Development plan unlimited features).
   * Backend still enforces actual limits; this function only controls UI behavior.
   */
  hasSurpassedSubscriptionQuotaLimit: <T extends keyof SubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: SubscriptionCountBasedUsage[T]
  ) => boolean;
  /**
   * Quota checking function with business rules applied.
   *
   * This function wraps the pure calculation utilities from SubscriptionDataProvider/utils
   * and applies plan-specific enforcement policies (e.g., Development plan unlimited features).
   * Backend still enforces actual limits; this function only controls UI behavior.
   */
  hasReachedSubscriptionQuotaLimit: <T extends keyof SubscriptionCountBasedUsage>(
    quotaKey: T,
    usage?: SubscriptionCountBasedUsage[T]
  ) => boolean;
};

export type SubscriptionContext = BaseContext & SubscriptionSupplementContext;

export type FullContext = BaseContext & SubscriptionSupplementContext & SubscriptionResourceStatus;
