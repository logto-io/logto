export const searchKeys = Object.freeze({
  notification: 'notification',
  noCache: 'no_cache',
});

export const handleSearchParametersData = () => {
  const { search } = window.location;

  if (!search) {
    return;
  }

  const parameters = new URLSearchParams(search);

  const notification = parameters.get(searchKeys.notification);

  if (notification) {
    sessionStorage.setItem(searchKeys.notification, notification);
  }

  if (parameters.get(searchKeys.noCache) !== null) {
    sessionStorage.setItem(searchKeys.noCache, 'true');
  }
};
