export enum ReservedPlanId {
  free = 'free',
  hobby = 'hobby',
  pro = 'pro',
}

export const reservedPlanIds: string[] = Object.values(ReservedPlanId);

export const reservedPlanIdOrder: string[] = [
  ReservedPlanId.free,
  ReservedPlanId.hobby,
  ReservedPlanId.pro,
];

export const checkoutStateQueryKey = 'checkout-state';
