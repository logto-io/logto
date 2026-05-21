import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, uploadFileGuard, userAssetsGuard } from '@logto/schemas';
import { object } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SystemContext from '#src/tenants/SystemContext.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { uploadAvatar } from '../avatar-upload.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountUserAssetsRoutes<T extends UserRouter>(
  ...[router, { id: tenantId }]: RouterInitArgs<T>
) {
  // TODO: Remove this dev feature gate when avatar upload is ready for production.
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    `${accountApiPrefix}/user-assets/avatar`,
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

      assertThat(
        scopes.has(UserScope.Profile),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      assertThat(
        fields.avatar === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      const { file: bodyFiles } = ctx.guard.files;

      const { storageProviderConfig } = SystemContext.shared;

      ctx.body = await uploadAvatar({
        file: bodyFiles[0],
        storageProviderConfig,
        objectKeyPrefix: `${tenantId}/${userId}`,
        logError: (error) => {
          getConsoleLogFromContext(ctx).error(error);
        },
      });

      return next();
    }
  );
}
