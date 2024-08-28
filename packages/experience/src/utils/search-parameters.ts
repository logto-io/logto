export const searchKeys = Object.freeze({
  noCache: 'no_cache',
});

export const handleSearchParametersData = () => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  const parameters = new URLSearchParams(search);

  if (parameters.get(searchKeys.noCache) !== null) {
    sessionStorage.setItem(searchKeys.noCache, 'true');
  }
};
