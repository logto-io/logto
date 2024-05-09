import { readFile } from 'node:fs/promises';

import { consoleLog } from '@logto/cli/lib/utils.js';
import {
  userAssetsServiceStatusGuard,
  allowUploadMimeTypes,
  maxUploadFileSize,
  type UserAssets,
  userAssetsGuard,
  adminTenantId,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { format } from 'date-fns';
import { object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { uploadFileGuard } from '#src/utils/storage/consts.js';
import { buildUploadFile } from '#src/utils/storage/index.js';

import type { AuthedMeRouter } from './types.js';

/**
 * Duplicated from `/user-assets` management API and used specifically for admin tenant.
 * E.g. Profile avatar upload.
 *
 * @todo: Refactor to reuse as much code as possible. @Charles
 */
export default function userAssetsRoutes<T extends AuthedMeRouter>(...[router]: RouterInitArgs<T>) {
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
        file: uploadFileGuard,
      }),
      response: userAssetsGuard,
    }),
    async (ctx, next) => {
      const { file } = ctx.guard.files;

      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(
        allowUploadMimeTypes.map(String).includes(file.mimetype),
        'guard.mime_type_not_allowed'
      );

      const { storageProviderConfig } = SystemContext.shared;
      assertThat(storageProviderConfig, 'storage.not_configured');

      const userId = ctx.auth.id;
      const uploadFile = buildUploadFile(storageProviderConfig);
      const objectKey = `${adminTenantId}/${userId}/${format(
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
        consoleLog.error(error);
        throw new RequestError({
          code: 'storage.upload_error',
          status: 500,
        });
      }

      return next();
    }
  );
}
