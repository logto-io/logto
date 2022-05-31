/**
 * Native SDK Utility Methods
 */
export const getLogtoNativeSdk = () => {
  if (typeof logtoNativeSdk !== 'undefined') {
    return logtoNativeSdk;
  }
};

export const isNativeWebview = () => {
  const platform = getLogtoNativeSdk()?.platform ?? '';

  return ['ios', 'android'].includes(platform);
};
