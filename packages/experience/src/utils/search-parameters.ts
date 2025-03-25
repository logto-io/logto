import { condString } from '@silverhand/essentials';

export const searchKeysCamelCase = Object.freeze(['organizationId', 'appId'] as const);

type SearchKeysCamelCase = (typeof searchKeysCamelCase)[number];

export const searchKeys = Object.freeze({
  /**
   * The key for specifying the organization ID that may be used to override the default settings.
   */
  organizationId: 'organization_id',
  /** The current application ID. */
  appId: 'app_id',
} satisfies Record<SearchKeysCamelCase, string>);

/**
 * The one-time token used as verification method.
 * Example usage: Magic link
 */
export const oneTimeTokenSearchKey = 'one_time_token';

export const handleSearchParametersData = () => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  const parameters = new URLSearchParams(search);

  // Store known search keys to the session storage and remove them from the URL to keep the URL
  // clean.
  for (const key of Object.values(searchKeys)) {
    const value = parameters.get(key);
    if (value) {
      sessionStorage.setItem(key, value);
      parameters.delete(key);
    } else {
      sessionStorage.removeItem(key);
    }
  }

  const conditionalParamString = condString(parameters.size > 0 && `?${parameters.toString()}`);

  // Check one-time token existence, and redirect to the `/one-time-token` route.
  const oneTimeToken = parameters.get(oneTimeTokenSearchKey);
  if (oneTimeToken) {
    window.history.replaceState({}, '', '/one-time-token/' + oneTimeToken + conditionalParamString);
    return;
  }

  window.history.replaceState({}, '', window.location.pathname + conditionalParamString);
};
