import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { condString, condArray } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { findUp } from 'find-up';
import { type IRouterParamContext } from 'koa-router';
import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { translationSchemas } from '#src/utils/zod.js';

import { managementApiAuthDescription, userApiAuthDescription } from '../consts.js';

import {
  type FindSupplementFilesOptions,
  devFeatureTag,
  findSupplementFiles,
  pruneSwaggerDocument,
  removeUnnecessaryOperations,
  shouldThrow,
  validateSupplement,
  validateSwaggerDocument,
} from './general.js';
import { buildPathIdParameters, customParameters, mergeParameters } from './parameters.js';

// Add more components here to cover more ID parameters in paths. For example, if there is a new API
// identifiable entity `/api/entities`, and you want to use `/api/entities/{id}`, add the entity here.
const managementApiIdentifiableEntityNames = Object.freeze(
  condArray<string>(
    'key',
    'connector-factory',
    'factory',
    'application',
    'connector',
    'sso-connector',
    'resource',
    'user',
    'log',
    'role',
    'scope',
    'hook',
    'domain',
    'verification',
    'organization',
    'organization-role',
    'organization-scope',
    'organization-invitation',
    'saml-application',
    'secret',
    'email-template',
    'one-time-token'
  )
);

/** Additional tags that cannot be inferred from the path. */
const additionalTags = Object.freeze(
  condArray<string>(
    'Organization applications',
    'Custom UI assets',
    'Organization users',
    'SAML applications',
    'SAML applications auth flow',
    'One-time tokens',
    'Captcha provider',
    'Custom profile fields'
  )
);

export const buildManagementApiBaseDocument = (
  pathMap: Map<string, OpenAPIV3.PathItemObject>,
  tags: Set<string>,
  origin: string
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  servers: [
    {
      url: EnvSet.values.isCloud ? 'https://[tenant_id].logto.app/' : origin,
      description: 'Logto endpoint address.',
    },
  ],
  info: {
    title: 'Logto API references',
    description:
      'API references for Logto services.' +
      condString(
        EnvSet.values.isCloud &&
          '\n\nNote: The documentation is for Logto Cloud. If you are using Logto OSS, please refer to the response of `/api/swagger.json` endpoint on your Logto instance.'
      ),
    version: 'Cloud',
  },
  paths: Object.fromEntries(pathMap),
  security: [{ OAuth2: ['all'] }],
  components: {
    securitySchemes: {
      OAuth2: {
        type: 'oauth2',
        description: managementApiAuthDescription,
        flows: {
          clientCredentials: {
            tokenUrl: '/oidc/token',
            scopes: {
              all: 'All scopes',
            },
          },
        },
      },
    },
    schemas: translationSchemas,
    parameters: managementApiIdentifiableEntityNames.reduce(
      (previous, entityName) => ({
        ...previous,
        ...buildPathIdParameters(entityName),
      }),
      customParameters()
    ),
  },
  tags: [...tags, ...additionalTags].map((tag) => ({ name: tag })),
});

// ID parameters for experience API entities.
const experienceIdentifiableEntityNames = Object.freeze(['connector', 'verification']);

export const buildExperienceApiBaseDocument = (
  pathMap: Map<string, OpenAPIV3.PathItemObject>,
  tags: Set<string>,
  origin: string
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  servers: [
    {
      url: EnvSet.values.isCloud ? 'https://[tenant_id].logto.app/' : origin,
      description: 'Logto endpoint address.',
    },
  ],
  info: {
    title: 'Logto experience API references',
    description:
      'API references for Logto experience interaction.' +
      condString(
        EnvSet.values.isCloud &&
          '\n\nNote: The documentation is for Logto Cloud. If you are using Logto OSS, please refer to the response of `/api/swagger.json` endpoint on your Logto instance.'
      ),
    version: 'Cloud',
  },
  paths: Object.fromEntries(pathMap),
  security: [{ cookieAuth: ['all'] }],
  components: {
    schemas: translationSchemas,
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: '_interaction',
      },
    },
    parameters: experienceIdentifiableEntityNames.reduce(
      (previous, entityName) => ({
        ...previous,
        ...buildPathIdParameters(entityName),
      }),
      customParameters()
    ),
  },
  tags: [...tags].map((tag) => ({ name: tag })),
});

const userApiIdentifiableEntityNames = Object.freeze(['profile', 'verification', 'connector']);

export const buildUserApiBaseDocument = (
  pathMap: Map<string, OpenAPIV3.PathItemObject>,
  tags: Set<string>,
  origin: string
): OpenAPIV3.Document => ({
  openapi: '3.0.1',
  servers: [
    {
      url: EnvSet.values.isCloud ? 'https://[tenant_id].logto.app/' : origin,
      description: 'Logto endpoint address.',
    },
  ],
  info: {
    title: 'Logto user API references',
    description:
      'API references for Logto user interaction.' +
      condString(
        EnvSet.values.isCloud &&
          '\n\nNote: The documentation is for Logto Cloud. If you are using Logto OSS, please refer to the response of `/api/swagger.json` endpoint on your Logto instance.'
      ),
    version: 'Cloud',
  },
  paths: Object.fromEntries(pathMap),
  security: [{ cookieAuth: ['all'] }],
  components: {
    schemas: translationSchemas,
    securitySchemes: {
      OAuth2: {
        type: 'oauth2',
        description: userApiAuthDescription,
        flows: {
          clientCredentials: {
            tokenUrl: '/oidc/token',
            scopes: {
              openid: 'OpenID scope',
              profile: 'Profile scope',
            },
          },
        },
      },
    },
    parameters: userApiIdentifiableEntityNames.reduce(
      (previous, entityName) => ({
        ...previous,
        ...buildPathIdParameters(entityName),
      }),
      {}
    ),
  },
  tags: [...tags].map((tag) => ({ name: tag })),
});

export const getSupplementDocuments = async (
  directory = 'routes',
  option?: FindSupplementFilesOptions
) => {
  // Find supplemental documents
  const routesDirectory = await findUp(directory, {
    type: 'directory',
    cwd: fileURLToPath(import.meta.url),
  });
  assertThat(routesDirectory, new Error('Cannot find routes directory.'));

  const supplementPaths = await findSupplementFiles(routesDirectory, option);

  const allSupplementDocuments = await Promise.all(
    supplementPaths.map(async (path) =>
      removeUnnecessaryOperations(
        // eslint-disable-next-line no-restricted-syntax -- trust the type here as we'll validate it later
        JSON.parse(await fs.readFile(path, 'utf8')) as DeepPartial<OpenAPIV3.Document>
      )
    )
  );

  // Filter out supplement documents that are for dev features when dev features are disabled.
  const supplementDocuments = allSupplementDocuments.filter(
    (supplement) =>
      EnvSet.values.isDevFeaturesEnabled ||
      !supplement.tags?.find((tag) => tag?.name === devFeatureTag)
  );

  return supplementDocuments;
};

export const assembleSwaggerDocument = <ContextT extends IRouterParamContext>(
  supplementDocuments: Array<DeepPartial<OpenAPIV3.Document>>,
  baseDocument: OpenAPIV3.Document,
  ctx: ContextT
) => {
  const data = supplementDocuments.reduce<OpenAPIV3.Document>(
    (document, supplement) =>
      deepmerge<OpenAPIV3.Document, DeepPartial<OpenAPIV3.Document>>(document, supplement, {
        arrayMerge: mergeParameters,
      }),
    baseDocument
  );

  pruneSwaggerDocument(data);

  if (EnvSet.values.isUnitTest) {
    getConsoleLogFromContext(ctx).warn('Skip validating swagger document in unit test.');
  }
  // Don't throw for integrity check in production as it has no benefit.
  else if (shouldThrow()) {
    for (const document of supplementDocuments) {
      validateSupplement(baseDocument, document);
    }
    validateSwaggerDocument(data);
  }

  return data;
};
