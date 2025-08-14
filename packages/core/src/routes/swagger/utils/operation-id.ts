import camelcase from 'camelcase';
import { OpenAPIV3 } from 'openapi-types';
import pluralize from 'pluralize';

import { EnvSet } from '#src/env-set/index.js';

import { accountApiPrefix } from '../../account/constants.js';
import { verificationApiPrefix } from '../../verification/index.js';

import { shouldThrow } from './general.js';

const chunk = <T>(array: T[], chunkSize: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
    array.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

const methodToVerb = Object.freeze({
  get: 'Get',
  post: 'Create',
  put: 'Replace',
  patch: 'Update',
  delete: 'Delete',
  options: 'Options',
  head: 'Head',
  trace: 'Trace',
} satisfies Record<OpenAPIV3.HttpMethods, string>);

type RouteDictionary = Record<`${OpenAPIV3.HttpMethods} ${string}`, string>;

const devFeatureCustomRoutes: RouteDictionary = Object.freeze({
  'get /custom-profile-fields/:name': 'GetCustomProfileFieldByName',
  'put /custom-profile-fields/:name': 'UpdateCustomProfileFieldByName',
  'delete /custom-profile-fields/:name': 'DeleteCustomProfileFieldByName',
  'post /custom-profile-fields/batch': 'CreateCustomProfileFieldsBatch',
  'post /custom-profile-fields/properties/sie-order': 'UpdateCustomProfileFieldsSieOrder',
});

export const customRoutes: Readonly<RouteDictionary> = Object.freeze({
  // Authn
  'get /authn/hasura': 'GetHasuraAuth',
  'post /authn/saml/:connectorId': 'AssertSaml',
  'post /authn/single-sign-on/saml/:connectorId': 'AssertSingleSignOnSaml',
  // Organization users
  'post /organizations/:id/users': 'AddOrganizationUsers',
  'post /organizations/:id/users/roles': 'AssignOrganizationRolesToUsers',
  'post /organizations/:id/users/:userId/roles': 'AssignOrganizationRolesToUser',
  // Organization applications
  'post /organizations/:id/applications': 'AddOrganizationApplications',
  'post /organizations/:id/applications/roles': 'AssignOrganizationRolesToApplications',
  'post /organizations/:id/applications/:applicationId/roles':
    'AssignOrganizationRolesToApplication',
  // Configs
  'get /configs/jwt-customizer': 'ListJwtCustomizers',
  'put /configs/jwt-customizer/:tokenTypePath': 'UpsertJwtCustomizer',
  'patch /configs/jwt-customizer/:tokenTypePath': 'UpdateJwtCustomizer',
  'get /configs/jwt-customizer/:tokenTypePath': 'GetJwtCustomizer',
  'delete /configs/jwt-customizer/:tokenTypePath': 'DeleteJwtCustomizer',
  'post /configs/jwt-customizer/test': 'TestJwtCustomizer',
  'get /configs/oidc/:keyType': 'GetOidcKeys',
  'delete /configs/oidc/:keyType/:keyId': 'DeleteOidcKey',
  'post /configs/oidc/:keyType/rotate': 'RotateOidcKeys',
  'get /configs/admin-console': 'GetAdminConsoleConfig',
  'patch /configs/admin-console': 'UpdateAdminConsoleConfig',
  // Systems
  'get /systems/application': 'GetSystemApplicationConfig',
  // Applications
  'post /applications/:applicationId/roles': 'AssignApplicationRoles',
  'get /applications/:id/protected-app-metadata/custom-domains':
    'ListApplicationProtectedAppMetadataCustomDomains',
  'post /applications/:id/protected-app-metadata/custom-domains':
    'CreateApplicationProtectedAppMetadataCustomDomain',
  'delete /applications/:id/protected-app-metadata/custom-domains/:domain':
    'DeleteApplicationProtectedAppMetadataCustomDomain',
  'delete /applications/:applicationId/user-consent-scopes/:scopeType/:scopeId':
    'DeleteApplicationUserConsentScope',
  // Users
  'post /users/:userId/roles': 'AssignUserRoles',
  'post /users/:userId/password/verify': 'VerifyUserPassword',
  // Dashboard
  'get /dashboard/users/total': 'GetTotalUserCount',
  'get /dashboard/users/new': 'GetNewUserCounts',
  'get /dashboard/users/active': 'GetActiveUserCounts',
  // Verification code
  'post /verification-codes/verify': 'VerifyVerificationCode',
  // User assets
  'get /user-assets/service-status': 'GetUserAssetServiceStatus',
  // Well-known
  'get /.well-known/phrases': 'GetSignInExperiencePhrases',
  'get /.well-known/sign-in-exp': 'GetSignInExperienceConfig',
  // Custom UI assets
  'post /sign-in-exp/default/custom-ui-assets': 'UploadCustomUiAssets',
  // One-time tokens
  'post /one-time-tokens': 'AddOneTimeTokens',
  'post /one-time-tokens/verify': 'VerifyOneTimeToken',
  // Sentinel activities
  'post /sentinel-activities/delete': 'DeleteSentinelActivities',
  ...(EnvSet.values.isDevFeaturesEnabled ? devFeatureCustomRoutes : {}),
} satisfies RouteDictionary); // Key assertion doesn't work without `satisfies`

/**
 * Given a set of built custom routes, throws an error if there are any differences between the
 * built routes and the routes defined in `customRoutes`.
 */
export const throwByDifference = (builtCustomRoutes: Set<string>) => {
  // Unit tests are hard to cover the full list of custom routes, skip the check.
  if (EnvSet.values.isUnitTest) {
    return;
  }

  if (shouldThrow() && builtCustomRoutes.size !== Object.keys(customRoutes).length) {
    const missingRoutes = Object.entries(customRoutes).filter(
      ([path]) => !builtCustomRoutes.has(path)
    );

    if (missingRoutes.length > 0) {
      throw new Error(
        'Not all custom routes are built.\n' +
          `Missing routes: ${missingRoutes.map(([path]) => path).join(', ')}.`
      );
    }

    const extraRoutes = [...builtCustomRoutes].filter(
      (path) => !Object.keys(customRoutes).includes(path)
    );

    if (extraRoutes.length > 0) {
      throw new Error(
        'There are extra routes that are built but not defined in `customRoutes`.\n' +
          `Extra routes: ${extraRoutes.join(', ')}.`
      );
    }
  }
};

/** Path segments that are treated as namespace prefixes. */
const namespacePrefixes = Object.freeze(['jit', '.well-known']);
const exceptionPrefixes = Object.freeze([
  '/interaction',
  '/experience',
  '/sign-in-exp/default/check-password',
  accountApiPrefix,
  verificationApiPrefix,
]);

const isPathParameter = (segment?: string) =>
  Boolean(segment && (segment.startsWith(':') || segment.startsWith('{')));

const throwIfNeeded = (method: OpenAPIV3.HttpMethods, path: string) => {
  if (shouldThrow()) {
    throw new Error(`Invalid path for generating operation ID: ${method} ${path}`);
  }
};

/**
 * Given a method and a path, generates an operation ID that is friendly for creating client SDKs.
 *
 * The generated operation ID is in the format of `VerbNounNoun...` where `Verb` is translated from
 * the HTTP method and `Noun` is the path segment in PascalCase. Some exceptions:
 *
 * 1. If an override is found in `customRoutes`, it will be used instead.
 * 2. If the HTTP method is `GET` and the path does not end with a path parameter, the verb will be
 * `List`.
 * 3. If the path segment is a namespace prefix, the trailing `/` will be replaced with `-`.
 *
 * @example
 * buildOperationId('get', '/foo/:fooId/bar/:barId') // GetFooBar
 * buildOperationId('post', '/foo/:fooId/bar') // CreateFooBar
 * buildOperationId('get', '/foo/:fooId/bar') // ListFooBars
 * buildOperationId('get', '/jit/foo') // GetJitFoo
 *
 * @see {@link customRoutes} for the full list of overrides.
 * @see {@link methodToVerb} for the mapping of HTTP methods to verbs.
 * @see {@link namespacePrefixes} for the list of namespace prefixes.
 */

export const buildOperationId = (method: OpenAPIV3.HttpMethods, path: string) => {
  const customOperationId = customRoutes[`${method} ${path}`];

  if (customOperationId) {
    return customOperationId;
  }

  // Skip interactions APIs as they are going to replaced by the new APIs soon.
  // Skip experience APIs, as all the experience APIs' `operationId` will be customized in the custom openapi.json documents.
  if (exceptionPrefixes.some((prefix) => path.startsWith(prefix))) {
    return;
  }

  const splitted = namespacePrefixes
    .reduce((accumulator, prefix) => accumulator.replace(prefix + '/', prefix + '-'), path)
    .split('/');

  const lastItem = splitted.at(-1);

  if (!lastItem) {
    throwIfNeeded(method, path);
    return;
  }

  const isForSingleItem = isPathParameter(lastItem);
  const items = chunk(splitted.slice(1, isForSingleItem ? undefined : -1), 2);

  // Check if all items have the pattern of `[name, parameter]`
  if (
    !items.every((values): values is [string, string] =>
      Boolean(values[0] && values[1] && !isPathParameter(values[0]) && isPathParameter(values[1]))
    )
  ) {
    throwIfNeeded(method, path);
    return;
  }

  const itemTypes = items.map(([name]) =>
    camelcase(pluralize.singular(name), { pascalCase: true })
  );

  const verb =
    !isForSingleItem && method === OpenAPIV3.HttpMethods.GET && pluralize.isPlural(lastItem)
      ? 'List'
      : methodToVerb[method];

  if (isForSingleItem) {
    return verb + itemTypes.join('');
  }

  return (
    verb +
    itemTypes.join('') +
    camelcase(method === OpenAPIV3.HttpMethods.POST ? pluralize.singular(lastItem) : lastItem, {
      pascalCase: true,
    })
  );
};
