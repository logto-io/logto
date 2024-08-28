import { type Subscription } from '@/cloud/types/router';
import { type SubscriptionPlan } from '@/types/subscriptions';

export type Context = {
  subscriptionPlans: SubscriptionPlan[];
  currentPlan: SubscriptionPlan;
  currentSubscription: Subscription;
  onCurrentSubscriptionUpdated: (subscription?: Subscription) => void;
};
