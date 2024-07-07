import { condString } from '@silverhand/essentials';

export const searchKeys = Object.freeze({
  noCache: 'no_cache',
  /**
   * The key for specifying the organization ID that may be used to override the default settings.
   */
  organizationId: 'organization_id',
});

export const handleSearchParametersData = () => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  // TODO: will refactor soon
  const parameters = new URLSearchParams(search);

  if (parameters.get(searchKeys.noCache) !== null) {
    sessionStorage.setItem(searchKeys.noCache, 'true');
  }

  const organizationId = parameters.get(searchKeys.organizationId);
  if (organizationId) {
    sessionStorage.setItem(searchKeys.organizationId, organizationId);
    parameters.delete(searchKeys.organizationId);
  }

  window.history.replaceState(
    {},
    '',
    window.location.pathname + condString(parameters.size > 0 && `?${parameters.toString()}`)
  );
};
