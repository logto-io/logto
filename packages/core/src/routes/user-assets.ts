import { readFile } from 'fs/promises';

import { generateStandardId } from '@logto/core-kit';
import { StorageProviderConfigKey, storageProviderDataGuard } from '@logto/schemas';
import { object } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';
import {
  allowUploadMimeTypes,
  maxUploadFileSize,
  uploadFileGuard,
} from '#src/utils/storage/consts.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getTenantId } from '#src/utils/tenant.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function userAssetsRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    logtoConfigs: { getRowByKey },
  } = queries;

  router.post(
    '/user-assets',
    koaGuard({
      files: object({
        file: uploadFileGuard,
      }),
    }),
    async (ctx, next) => {
      const { file } = ctx.guard.files;

      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');
      assertThat(allowUploadMimeTypes.includes(file.mimetype), 'guard.mime_type_not_allowed');

      const tenantId = getTenantId(ctx.URL);
      assertThat(tenantId, 'guard.can_not_get_tenant_id');

      const configRow = await getRowByKey(StorageProviderConfigKey.StorageProvider);
      assertThat(configRow, 'storage.not_configured');
      const result = storageProviderDataGuard.safeParse(configRow.value);
      assertThat(result.success, 'storage.not_configured');

      const userId = ctx.auth.id;
      const config = result.data;
      const uploadFile = buildUploadFile(config);
      const objectKey = `${tenantId}/${userId}/${generateStandardId()}/${file.originalFilename}`;

      try {
        await uploadFile(await readFile(file.filepath), objectKey, file.mimetype);

        ctx.body = {
          url: `${config.publicUrl}/${objectKey}`,
        };
      } catch {
        throw new RequestError('storage.upload_error');
      }

      return next();
    }
  );
}
