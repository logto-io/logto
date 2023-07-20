import dayjs from 'dayjs';

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

type FormatPeriodOptions = {
  periodStart: Date;
  periodEnd: Date;
  displayYear?: boolean;
};
export const formatPeriod = ({ periodStart, periodEnd, displayYear }: FormatPeriodOptions) => {
  const format = displayYear ? 'MMM D, YYYY' : 'MMM D';
  const formattedStart = dayjs(periodStart).format(format);
  const formattedEnd = dayjs(periodEnd).format(format);
  return `${formattedStart} - ${formattedEnd}`;
};
