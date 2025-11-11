import type { TenantIdConfig } from '@logto/schemas';
import { generateId, type IdFormat } from '@logto/shared';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

export type IdFormatLibrary = ReturnType<typeof createIdFormatLibrary>;

/**
 * Library for managing ID format configuration per tenant.
 * Provides methods to retrieve ID format settings and generate IDs based on tenant configuration.
 */
export const createIdFormatLibrary = (tenantId: string, queries: Queries) => {
  const { tenantIdConfig } = queries;

  // Cache for tenant ID configuration
  const cache: {
    config?: TenantIdConfig;
  } = {
    config: undefined,
  };

  /**
   * Get the tenant ID configuration, using cache if available.
   */
  const getTenantIdConfig = async (): Promise<TenantIdConfig> => {
    if (cache.config) {
      return cache.config;
    }

    const config = await tenantIdConfig.findTenantIdConfigByTenantId(tenantId);

    if (!config) {
      // If no config exists, return default values based on environment variables
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const defaultFormat = EnvSet.values.defaultIdFormat;
      return {
        tenantId,
        idFormat: defaultFormat === 'uuidv7' ? 'uuidv7' : 'nanoid',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- Cache is necessary for performance
    cache.config = config;
    return config;
  };

  /**
   * Clear the configuration cache. Should be called when configuration is updated.
   */
  const clearCache = () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Cache is necessary for performance
    cache.config = undefined;
  };

  /**
   * Get the ID format for all entities (users, organizations, roles, organization roles).
   */
  const getIdFormat = async (): Promise<IdFormat> => {
    const config = await getTenantIdConfig();
    const { idFormat } = config;
    return idFormat === 'uuidv7' ? 'uuidv7' : 'nanoid';
  };

  /**
   * Generate a user ID based on tenant configuration.
   */
  const generateUserId = async (): Promise<string> => {
    const format = await getIdFormat();
    return generateId(format, 12); // 12 is the nanoid size for user IDs
  };

  /**
   * Generate an organization ID based on tenant configuration.
   */
  const generateOrganizationId = async (): Promise<string> => {
    const format = await getIdFormat();
    return generateId(format, 21); // 21 is the nanoid size for organization IDs
  };

  /**
   * Generate a role ID based on tenant configuration.
   */
  const generateRoleId = async (): Promise<string> => {
    const format = await getIdFormat();
    return generateId(format, 21); // 21 is the nanoid size for role IDs
  };

  /**
   * Generate an organization role ID based on tenant configuration.
   */
  const generateOrganizationRoleId = async (): Promise<string> => {
    const format = await getIdFormat();
    return generateId(format, 21); // 21 is the nanoid size for organization role IDs
  };

  /**
   * Generate an application ID based on tenant configuration.
   */
  const generateApplicationId = async (): Promise<string> => {
    const format = await getIdFormat();
    return generateId(format, 21); // 21 is the nanoid size for application IDs
  };

  return {
    getTenantIdConfig,
    clearCache,
    getIdFormat,
    generateUserId,
    generateOrganizationId,
    generateRoleId,
    generateOrganizationRoleId,
    generateApplicationId,
  };
};
