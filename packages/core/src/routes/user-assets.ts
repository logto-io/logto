import { readFile } from 'node:fs/promises';

import type { UserAssets } from '@logto/schemas';
import {
  userAssetsGuard,
  userAssetsServiceStatusGuard,
  allowUploadMimeTypes,
  maxUploadFileSize,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { format } from 'date-fns';
import { object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { uploadFileGuard } from '#src/utils/storage/consts.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function userAssetsRoutes<T extends ManagementApiRouter>(
  ...[router]: RouterInitArgs<T>
) {
  router.get(
    '/user-assets/service-status',
    koaGuard({
      response: userAssetsServiceStatusGuard,
    }),
    async (ctx, next) => {
      const { storageProviderConfig } = SystemContext.shared;
      const status = storageProviderConfig
        ? {
            status: 'ready',
            allowUploadMimeTypes,
            maxUploadFileSize,
          }
        : {
            status: 'not_configured',
          };

      ctx.body = status;

      return next();
    }
  );

  router.post(
    '/user-assets',
    koaGuard({
      files: object({
        file: uploadFileGuard.array().min(1),
      }),
      response: userAssetsGuard,
    }),
    async (ctx, next) => {
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

      const userId = ctx.auth.id;
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
