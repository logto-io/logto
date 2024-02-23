import { conditional, trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import dayjs from 'dayjs';

import { tryReadResponseErrorBody } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionPlanResponse } from '@/cloud/types/router';
import { ticketSupportResponseTimeMap } from '@/consts/plan-quotas';
import { featuredPlanIdOrder, featuredPlanIds } from '@/consts/subscriptions';
import { type SubscriptionPlanQuota, type SubscriptionPlan } from '@/types/subscriptions';

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

/**
 * Parse the error data from the server if the error is caused by exceeding the quota limit.
 * This is used to handle cases where users attempt to switch subscription plans, but the quota limit is exceeded.
 *
 * @param error - The error object from the server.
 *
 * @returns If the error is caused by exceeding the quota limit, returns `[true, exceededQuotaKeys]`, otherwise `[false]`.
 *
 * @remarks
 * - This function parses the exceeded quota data from the error message string, since the server which uses `withtyped`
 * only supports to return a `message` field in the error response body.
 * - The choice to return exceeded quota keys instead of the entire data object is intentional.
 * The data returned from the server is quota usage data, but what we want is quota limit data, so we will read quota limits from subscription plans.
 */
export const parseExceededQuotaLimitError = async (
  error: unknown
): Promise<[false] | [true, Array<keyof SubscriptionPlanQuota>]> => {
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
    data && trySafe(() => JSON.parse(data) as Partial<SubscriptionPlanQuota>)
  );

  if (!exceededQuota) {
    return [false];
  }

  // eslint-disable-next-line no-restricted-syntax
  return [true, Object.keys(exceededQuota) as Array<keyof SubscriptionPlanQuota>];
};

export const pickupFeaturedPlans = (plans: SubscriptionPlan[]): SubscriptionPlan[] =>
  plans.filter(({ id }) => featuredPlanIds.includes(id));
