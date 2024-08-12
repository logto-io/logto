import {
  type LogtoSkuResponse,
  type Subscription,
  type NewSubscriptionQuota,
  type NewSubscriptionCountBasedUsage,
  type NewSubscriptionResourceScopeUsage,
  type NewSubscriptionRoleScopeUsage,
  type NewSubscriptionUpcomingInvoice,
} from '@/cloud/types/router';
import { type SubscriptionPlan } from '@/types/subscriptions';

export type Context = {
  /** @deprecated */
  subscriptionPlans: SubscriptionPlan[];
  /** @deprecated */
  currentPlan: SubscriptionPlan;
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
  upcomingInvoice: NewSubscriptionUpcomingInvoice;
  mutateSubscriptionQuotaAndUsages: () => void;
};

export type NewSubscriptionContext = Omit<Context, 'subscriptionPlans' | 'currentPlan'> &
  NewSubscriptionSupplementContext;

export type FullContext = Context & NewSubscriptionSupplementContext;
