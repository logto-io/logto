import { readFile } from 'node:fs/promises';

import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  allowUploadMimeTypes,
  maxUploadFileSize,
  uploadFileGuard,
  userAssetsGuard,
  userAssetsServiceStatusGuard,
  type UserAssets,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { format } from 'date-fns';
import { object } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountUserAssetsRoutes<T extends UserRouter>(
  ...[router]: RouterInitArgs<T>
) {
  // TODO: Remove this dev feature gate when avatar upload is ready for production.
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.get(
    `${accountApiPrefix}/user-assets/service-status`,
    koaGuard({
      response: userAssetsServiceStatusGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const { storageProviderConfig } = SystemContext.shared;
      ctx.body = storageProviderConfig
        ? {
            status: 'ready',
            allowUploadMimeTypes,
            maxUploadFileSize,
          }
        : {
            status: 'not_configured',
          };

      return next();
    }
  );

  router.post(
    `${accountApiPrefix}/user-assets`,
    koaGuard({
      files: object({
        file: uploadFileGuard.array().min(1),
      }),
      response: userAssetsGuard,
      status: [200, 400, 401, 403, 500],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');
      assertThat(
        fields.avatar === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      const { file: bodyFiles } = ctx.guard.files;
      const file = bodyFiles[0];
      assertThat(file, 'guard.invalid_input');
      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(
        allowUploadMimeTypes.map(String).includes(file.mimetype),
        'guard.mime_type_not_allowed'
      );

      const [tenantId] = await getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');

      const { storageProviderConfig } = SystemContext.shared;
      assertThat(storageProviderConfig, 'storage.not_configured');

      const uploadFile = buildUploadFile(storageProviderConfig);
      const objectKey = `${tenantId}/${userId}/${format(
        new Date(),
        'yyyy/MM/dd'
      )}/${generateStandardId(8)}/${file.originalFilename}`;

      try {
        const { url } = await uploadFile(await readFile(file.filepath), objectKey, {
          contentType: file.mimetype,
          publicUrl: storageProviderConfig.publicUrl,
        });

        const result: UserAssets = {
          url,
        };

        ctx.body = result;
      } catch (error: unknown) {
        getConsoleLogFromContext(ctx).error(error);
        throw new RequestError({
          code: 'storage.upload_error',
          status: 500,
        });
      }

      return next();
    }
  );
}
