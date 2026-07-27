type ActionsAvailability = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  actionsEnabled: boolean;
};

type ActionsQuotaData = {
  actionsEnabled?: boolean;
  inlineHooksEnabled?: boolean;
};

type NormalizeActionsQuotaOptions = {
  /**
   * The value to use when the Cloud response omits `actionsEnabled`.
   *
   * Omit it for responses where Cloud declares the key as required (e.g. the subscription
   * quota and usage), so that a missing key surfaces as an error instead of silently
   * disabling the feature. Pass it only for responses where the key is legitimately
   * optional, such as the SKU quota.
   */
  fallback?: boolean;
};

/**
 * Drop the legacy `inlineHooksEnabled` key from a Cloud quota payload and return it with a
 * guaranteed `actionsEnabled` boolean.
 */
export const normalizeActionsQuota = <Quota extends ActionsQuotaData>(
  quota: Quota,
  { fallback }: NormalizeActionsQuotaOptions = {}
) => {
  const actionsEnabled = quota.actionsEnabled ?? fallback;

  if (typeof actionsEnabled !== 'boolean') {
    throw new TypeError('Cloud response is missing the Actions quota.');
  }

  const { inlineHooksEnabled: _, ...rest } = quota;

  return { ...rest, actionsEnabled };
};

export const isActionsEnabled = ({
  isCloud,
  isDevFeaturesEnabled,
  actionsEnabled,
}: ActionsAvailability) => isDevFeaturesEnabled && (!isCloud || actionsEnabled);
