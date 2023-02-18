import type { createQueryClient } from '@withtyped/postgres';

type CreateClientConfig = Parameters<typeof createQueryClient>[0];

/* eslint-disable @silverhand/fp/no-mutation */
// Edited from https://github.com/gajus/slonik/blob/d66b76c44638c8b424cea55475d6e1385c2caae8/src/utilities/parseDsn.ts
export const parseDsn = (dsn?: string): CreateClientConfig => {
  if (!dsn?.trim()) {
    return;
  }

  const url = new URL(dsn);

  const config: NonNullable<CreateClientConfig> = {};

  if (url.host) {
    config.host = decodeURIComponent(url.hostname);
  }

  if (url.port) {
    config.port = Number(url.port);
  }

  const database = url.pathname.split('/')[1];

  if (database) {
    config.database = decodeURIComponent(database);
  }

  if (url.username) {
    config.user = decodeURIComponent(url.username);
  }

  if (url.password) {
    config.password = decodeURIComponent(url.password);
  }

  const {
    application_name: applicationName,
    sslmode: sslMode,
    ...unsupportedOptions
  } = Object.fromEntries(url.searchParams);

  if (Object.keys(unsupportedOptions).length > 0) {
    console.warn(
      {
        unsupportedOptions,
      },
      'unsupported DSN parameters'
    );
  }

  if (applicationName) {
    config.application_name = applicationName;
  }

  if (sslMode === 'require') {
    config.ssl = true;
  }

  return config;
};
/* eslint-enable @silverhand/fp/no-mutation */
