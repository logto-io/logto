/**
 * @fileoverview
 * Mapi (Management API) proxy is an endpoint in Logto Cloud that proxies the requests to the
 * corresponding Management API. It has the following benefits:
 *
 * - When we migrate the tenant management from API resources to tenant organizations, we can
 *   migrate Console to use the mapi proxy endpoint by changing only the base URL.
 * - It decouples the access control of Cloud user collaboration from the machine-to-machine access
 *   control of the Management API.
 * - The mapi proxy endpoint shares the same domain with Logto Cloud, so it can be used in the
 *   browser without CORS.
 *
 * This module provides utilities to manage mapi proxy.
 */

import { generateStandardSecret } from '@logto/shared/universal';

import {
  RoleType,
  type Role,
  type CreateApplication,
  ApplicationType,
} from '../db-entries/index.js';
import { adminTenantId } from '../seeds/tenant.js';

/**
 * Given a tenant ID, return the role data for the mapi proxy.
 *
 * It follows a convention to generate all the fields which can be used across the system. See
 * source code for details.
 */
export const getMapiProxyRole = (tenantId: string): Readonly<Role> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: `m-${tenantId}`,
    name: `machine:mapi:${tenantId}`,
    description: `Machine-to-machine role for accessing Management API of tenant '${tenantId}'.`,
    type: RoleType.MachineToMachine,
    isDefault: false,
  });

/**
 * Given a tenant ID, return the application create data for the mapi proxy. The proxy will use the
 * application to access the Management API.
 *
 * It follows a convention to generate all the fields which can be used across the system. See
 * source code for details.
 */
export const getMapiProxyM2mApp = (tenantId: string): Readonly<CreateApplication> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: `m-${tenantId}`,
    secret: generateStandardSecret(32),
    name: `Management API access for ${tenantId}`,
    description: `Machine-to-machine app for accessing Management API of tenant '${tenantId}'.`,
    type: ApplicationType.MachineToMachine,
    oidcClientMetadata: {
      redirectUris: [],
      postLogoutRedirectUris: [],
    },
  });
