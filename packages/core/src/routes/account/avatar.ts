import { readFile } from 'node:fs/promises';

import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  adminTenantId,
  allowAvatarMimeTypes,
  maxUploadFileSize,
  StorageProvider,
  uploadFileGuard,
  userProfileResponseGuard,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { detectImageType } from '#src/utils/file.js';
import { buildUploadFile } from '#src/utils/storage/index.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { type RouterInitArgs, type UserRouter } from '../types.js';

import { accountApiPrefix } from './constants.js';
import { getAccountCenterFilteredProfile, getScopedProfile } from './utils/get-scoped-profile.js';

export default function avatarRoutes<T extends UserRouter>(
  ...[router, { queries, libraries, envSet }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById },
  } = queries;

  router.post(
    `${accountApiPrefix}/avatar`,
    koaGuard({
      files: z.object({
        file: uploadFileGuard.array().min(1),
      }),
      response: userProfileResponseGuard.partial(),
      status: [200, 400, 401, 500],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { fields } = ctx.accountCenter;

      // Validate file is present
      const { file: bodyFiles } = ctx.guard.files;
      const file = bodyFiles[0];
      assertThat(file, 'guard.invalid_input');
      assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');

      // Check account center visibility
      assertThat(
        fields.avatar === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      // Require profile scope for DB update
      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      // Read file into buffer
      const fileBuffer = await readFile(file.filepath);

      // Detect image type via magic bytes
      const detected = detectImageType(fileBuffer);
      assertThat(detected, 'guard.mime_type_not_allowed');
      assertThat(
        (allowAvatarMimeTypes as readonly string[]).includes(detected.mime),
        'guard.mime_type_not_allowed'
      );

      // Get storage provider
      const { storageProviderConfig } = SystemContext.shared;
      assertThat(storageProviderConfig, 'storage.not_configured');
      assertThat(
        storageProviderConfig.provider === StorageProvider.S3Storage,
        'storage.not_configured'
      );
      const storage = buildUploadFile(storageProviderConfig);

      // Build storage keys
      const extension = detected.extension;
      const finalKey = `${adminTenantId}/${userId}/you.${extension}`;
      const userPrefix = `${adminTenantId}/${userId}/you`;

      // Upload directly to final key (PutObject overwrites same-key atomically)
      try {
        await storage.uploadFile(fileBuffer, finalKey, {
          contentType: detected.mime,
          publicUrl: storageProviderConfig.publicUrl,
        });
      } catch {
        throw new RequestError({ code: 'storage.upload_error', status: 500 });
      }

      // Cleanup old files with other extensions (best-effort, don't fail)
      try {
        const existingFiles = await storage.listFiles(userPrefix);
        for (const existingKey of existingFiles) {
          if (existingKey !== finalKey) {
            await storage.deleteFile(existingKey);
          }
        }
      } catch (error: unknown) {
        getConsoleLogFromContext(ctx).error('Avatar cleanup failed:', error);
      }

      // Build the final URL
      let avatarUrl: string;
      if (storageProviderConfig.publicUrl) {
        avatarUrl = `${storageProviderConfig.publicUrl}/${finalKey}`;
      } else {
        // Use the assets serve route via the current request endpoint
        avatarUrl = `${envSet.endpoint.origin}/api/assets/${userId}/you.${extension}`;
      }
      // Add cache-busting
      avatarUrl = `${avatarUrl}?v=${Date.now()}`;

      // Update user record
      const updatedUser = await updateUserById(userId, {
        avatar: avatarUrl,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      // Return updated profile
      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = getAccountCenterFilteredProfile(profile, ctx.accountCenter);

      return next();
    }
  );
}
