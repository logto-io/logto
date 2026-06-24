import { ReservedPlanId } from '@logto/schemas';
import { conditional, trySafe, type Nullable } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import dayjs from 'dayjs';

import { tryReadResponseErrorBody } from '@/cloud/hooks/use-cloud-api';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import { ticketSupportResponseTimeMap } from '@/consts/plan-quotas';
import { featuredPlanIds, planIdOrder } from '@/consts/subscriptions';
import { type LogtoSkuQuota } from '@/types/skus';

const addSupportQuota = (logtoSkuResponse: LogtoSkuResponse) => {
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

/**
 * Format Logto SKUs responses.
 *
 * - add support quota to the SKUs.
 * - Sort the SKUs by the order of `featuredPlanIdOrder`.
 */
export const formatLogtoSkusResponses = (logtoSkus: LogtoSkuResponse[] | undefined) => {
  if (!logtoSkus) {
    return [];
  }

  return logtoSkus.map((logtoSku) => addSupportQuota(logtoSku));
};

const getSubscriptionPlanOrderById = (id: string) => {
  const index = planIdOrder[id];

  // Note: if the plan id is not in the featuredPlanIdOrder, it will be treated as the highest priority
  // E.g. enterprise plan.
  return index ?? Number.POSITIVE_INFINITY;
};

export const isDowngradePlan = (fromPlanId: string, toPlanId: string) =>
  getSubscriptionPlanOrderById(fromPlanId) > getSubscriptionPlanOrderById(toPlanId);

/**
 * Check if the two plan ids are equivalent,
 * one is grandfathered and the other is public visible featured plan.
 */
export const isEquivalentPlan = (fromPlanId: string, toPlanId: string) =>
  fromPlanId !== toPlanId &&
  getSubscriptionPlanOrderById(fromPlanId) === getSubscriptionPlanOrderById(toPlanId);

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

/**
 * Filter the featured plans (public visible) from the Logto SKUs API response.
 * and sorted by the order of {@link planIdOrder}.
 */
export const pickupFeaturedLogtoSkus = (logtoSkus: LogtoSkuResponse[]): LogtoSkuResponse[] =>
  logtoSkus
    .filter(({ id }) => featuredPlanIds.includes(id))
    .slice()
    .sort(
      ({ id: previousId }, { id: nextId }) =>
        getSubscriptionPlanOrderById(previousId) - getSubscriptionPlanOrderById(nextId)
    );

export const isPaidPlan = (planId: string, isEnterprisePlan: boolean) =>
  isProPlan(planId) || isEnterprisePlan;

export const isFeatureEnabled = (quota: Nullable<number>): boolean => {
  return quota === null || quota > 0;
};

/**
 * We may have more than one pro planId in the future.
 * E.g grandfathered {@link ReservedPlanId.Pro}, {@link ReservedPlanId.Pro202411} and new {@link ReservedPlanId.Pro202509}.
 * User this function to check if the planId can be considered as a pro plan.
 */
export const isProPlan = (planId: string) =>
  [ReservedPlanId.Pro, ReservedPlanId.Pro202411, ReservedPlanId.Pro202509].includes(
    // eslint-disable-next-line no-restricted-syntax
    planId as ReservedPlanId
  );
