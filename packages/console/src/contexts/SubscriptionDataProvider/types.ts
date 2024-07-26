import {
  type LogtoSkuResponse,
  type Subscription,
  type NewSubscriptionQuota,
  type NewSubscriptionUsage,
  type NewSubscriptionScopeUsage,
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
  currentSubscriptionUsage: NewSubscriptionUsage;
  currentSubscriptionScopeResourceUsage: NewSubscriptionScopeUsage;
  currentSubscriptionScopeRoleUsage: NewSubscriptionScopeUsage;
};

export type NewSubscriptionContext = Omit<Context, 'subscriptionPlans' | 'currentPlan'> &
  NewSubscriptionSupplementContext;

export type FullContext = Context & NewSubscriptionSupplementContext;
