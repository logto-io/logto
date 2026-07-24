type ActionsAvailability = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  actionsEnabled: boolean;
};

type ActionsQuotaData = {
  actionsEnabled?: boolean;
  inlineHooksEnabled?: boolean;
};

export const normalizeActionsQuota = <Quota extends ActionsQuotaData>(quota: Quota) => {
  if (typeof quota.actionsEnabled !== 'boolean') {
    throw new TypeError('Cloud response is missing the Actions quota.');
  }

  const { inlineHooksEnabled: _, ...rest } = quota;

  return { ...rest, actionsEnabled: quota.actionsEnabled };
};

export const isActionsEnabled = ({
  isCloud,
  isDevFeaturesEnabled,
  actionsEnabled,
}: ActionsAvailability) => isDevFeaturesEnabled && (!isCloud || actionsEnabled);
