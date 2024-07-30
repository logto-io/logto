import { type NewSubscriptionQuota } from '@/cloud/types/router';

// TODO: This is a copy from `@logto/cloud-models`, make a SSoT for this later
export enum LogtoSkuType {
  Basic = 'Basic',
  AddOn = 'AddOn',
}

export type LogtoSkuQuota = NewSubscriptionQuota & {
  // Add ticket support quota item to the plan since it will be compared in the downgrade plan notification modal.
  ticketSupportResponseTime: number;
};

export type LogtoSkuQuotaEntries = Array<[keyof LogtoSkuQuota, LogtoSkuQuota[keyof LogtoSkuQuota]]>;
