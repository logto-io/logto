type ActionsAvailability = {
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  inlineHooksEnabled: boolean;
};

export const isActionsEnabled = ({
  isCloud,
  isDevFeaturesEnabled,
  inlineHooksEnabled,
}: ActionsAvailability) => isDevFeaturesEnabled && (!isCloud || inlineHooksEnabled);
