export const getEditFlowRedirectUrl = (
  existingRedirectUrl: string | undefined,
  currentUrl: string
): string => existingRedirectUrl ?? currentUrl;
