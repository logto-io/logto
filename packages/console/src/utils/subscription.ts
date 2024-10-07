import { ReservedPlanId } from '@logto/schemas';
import { conditional, trySafe, type Nullable } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import dayjs from 'dayjs';

import { tryReadResponseErrorBody } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse, type SubscriptionPlanResponse } from '@/cloud/types/router';
import { ticketSupportResponseTimeMap } from '@/consts/plan-quotas';
import { featuredPlanIdOrder, featuredPlanIds } from '@/consts/subscriptions';
import { type LogtoSkuQuota } from '@/types/skus';

export const addSupportQuotaToPlan = (subscriptionPlanResponse: SubscriptionPlanResponse) => {
  const { id, quota } = subscriptionPlanResponse;

  return {
    ...subscriptionPlanResponse,
    quota: {
      ...quota,
      /**
       * Manually add this support quota item to the plan since it will be compared in the downgrade plan notification modal.
       */
      ticketSupportResponseTime: ticketSupportResponseTimeMap[id] ?? 0, // Fallback to not supported
    },
  };
};

export const addSupportQuota = (logtoSkuResponse: LogtoSkuResponse) => {
  const { id, quota } = logtoSkuResponse;

  return {
    ...logtoSkuResponse,
    quota: {
      ...quota,
      /**
       * Manually add this support quota item to the plan since it will be compared in the downgrade plan notification modal.
       */
      ticketSupportResponseTime: ticketSupportResponseTimeMap[id] ?? 0, // Fallback to not supported
    },
  };
};

const getSubscriptionPlanOrderById = (id: string) => {
  const index = featuredPlanIdOrder.indexOf(id);

  // Note: if the plan id is not in the featuredPlanIdOrder, it will be treated as the highest priority
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

// Duplication of `parseExceededQuotaLimitError` with different keys.
// `parseExceededQuotaLimitError` will be removed soon.
export const parseExceededSkuQuotaLimitError = async (
  error: unknown
): Promise<[false] | [true, Array<keyof LogtoSkuQuota>]> => {
  if (!(error instanceof ResponseError)) {
    return [false];
  }

  const { message } = (await tryReadResponseErrorBody(error)) ?? {};

  const match = message?.match(/Status exception: Exceeded quota limit\. (.+)$/);

  if (!match) {
    return [false];
  }

  const data = match[1];
  const exceededQuota = conditional(
    // eslint-disable-next-line no-restricted-syntax -- trust the type from the server if error message matches
    data && trySafe(() => JSON.parse(data) as Partial<LogtoSkuQuota>)
  );

  if (!exceededQuota) {
    return [false];
  }

  // eslint-disable-next-line no-restricted-syntax
  return [true, Object.keys(exceededQuota) as Array<keyof LogtoSkuQuota>];
};

export const pickupFeaturedLogtoSkus = (logtoSkus: LogtoSkuResponse[]): LogtoSkuResponse[] =>
  logtoSkus.filter(({ id }) => featuredPlanIds.includes(id));

export const isPaidPlan = (planId: string, isEnterprisePlan: boolean) =>
  planId === ReservedPlanId.Pro || isEnterprisePlan;

export const isFeatureEnabled = (quota: Nullable<number>): boolean => {
  return quota === null || quota > 0;
};
