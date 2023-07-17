import { type SubscriptionPlanResponse } from '@/cloud/types/router';
import {
  communitySupportEnabledMap,
  reservedPlanIdOrder,
  ticketSupportResponseTimeMap,
} from '@/consts/subscriptions';

export const addSupportQuotaToPlan = (subscriptionPlanResponse: SubscriptionPlanResponse) => {
  const { name, quota } = subscriptionPlanResponse;

  return {
    ...subscriptionPlanResponse,
    quota: {
      ...quota,
      communitySupportEnabled: communitySupportEnabledMap[name] ?? false, // Fallback to not supported
      ticketSupportResponseTime: ticketSupportResponseTimeMap[name] ?? 0, // Fallback to not supported
    },
  };
};

const getSubscriptionPlanOrderById = (id: string) => {
  const index = reservedPlanIdOrder.indexOf(id);

  // Note: if the plan id is not in the reservedPlanIdOrder, it will be treated as the highest priority
  return index === -1 ? Number.POSITIVE_INFINITY : index;
};

export const isDowngradePlan = (fromPlanId: string, toPlanId: string) =>
  getSubscriptionPlanOrderById(fromPlanId) > getSubscriptionPlanOrderById(toPlanId);
