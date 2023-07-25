export enum ReservedPlanId {
  free = 'free',
  hobby = 'hobby',
  pro = 'pro',
}

export const reservedPlanIdOrder: string[] = [
  ReservedPlanId.free,
  ReservedPlanId.hobby,
  ReservedPlanId.pro,
];

export const checkoutStateQueryKey = 'checkout-state';

export const checkoutSuccessCallbackPath = 'checkout-success';
