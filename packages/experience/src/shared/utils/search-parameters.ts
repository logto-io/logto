import { Theme } from '@logto/schemas';
import { condString } from '@silverhand/essentials';

import { isDevFeaturesEnabled } from '@/constants/env';

export const searchKeysCamelCase = Object.freeze(['organizationId', 'appId', 'uiLocales'] as const);

type SearchKeysCamelCase = (typeof searchKeysCamelCase)[number];

export const searchKeys = Object.freeze({
  /**
   * The key for specifying the organization ID that may be used to override the default settings.
   */
  organizationId: 'organization_id',
  /**
   * The current application ID.
   */
  appId: 'app_id',
  /**
   * The end-user's preferred languages, presented as a space-separated list of BCP47 language tags.
   * E.g. `en` or `en-US` or `en-US en`.
   */
  uiLocales: 'ui_locales',
} satisfies Record<SearchKeysCamelCase, string>);

/**
 * Overrides the theme the app would otherwise resolve from the end-user's OS settings. Kept out
 * of {@link searchKeys} because those keys are also sent to the sign-in experience API and
 * compared against the SSR payload, neither of which knows about the theme.
 */
export const themeSearchKey = 'theme';

/** All search keys that are persisted to the session storage at app startup. */
export const persistedSearchKeys = Object.freeze([
  ...Object.values(searchKeys),
  // Theme control from the authentication request is only available with dev features enabled.
  ...(isDevFeaturesEnabled ? [themeSearchKey] : []),
] as const);

/** The theme override from the search params, or `undefined` when absent or unsupported. */
export const getThemeOverride = (): Theme | undefined => {
  // Theme control from the authentication request is only available with dev features enabled.
  if (!isDevFeaturesEnabled) {
    return undefined;
  }

  const value = sessionStorage.getItem(themeSearchKey);

  return value === Theme.Light || value === Theme.Dark ? value : undefined;
};

const replaceSearchParameters = (parameters: URLSearchParams) => {
  const parameterString = parameters.toString();
  const conditionalParamString = condString(parameterString && `?${parameterString}`);

  // Preserve the existing history state (e.g. React Router's location state) to avoid
  // losing in-progress flow data (like Continue page's interactionEvent) on page refresh.
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + conditionalParamString + window.location.hash
  );
};

export const handleSearchParametersData = () => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  const parameters = new URLSearchParams(search);

  // Store known search keys to the session storage and remove them from the URL to keep the URL
  // clean.
  for (const key of persistedSearchKeys) {
    const value = parameters.get(key);
    if (value) {
      sessionStorage.setItem(key, value);
      if (key !== searchKeys.appId) {
        // Keep app_id in the URL for resuming sessions
        parameters.delete(key);
      }
    } else if (key !== searchKeys.appId) {
      sessionStorage.removeItem(key);
    }
  }

  replaceSearchParameters(parameters);
};

export const removeSearchParameters = (keys: readonly string[]) => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  const parameters = new URLSearchParams(search);
  const hasTargetParameter = keys.some((key) => parameters.has(key));

  if (!hasTargetParameter) {
    return;
  }

  for (const key of keys) {
    parameters.delete(key);
  }

  replaceSearchParameters(parameters);
};
