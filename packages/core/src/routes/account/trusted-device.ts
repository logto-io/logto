import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  accountTrustedDeviceResponseGuard,
  type AccountTrustedDeviceResponse,
} from '@logto/schemas';
import { pick } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { assertFirstPartyClient } from '#src/utils/assert-first-party-client.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountTrustedDeviceRoutes<T extends UserRouter>(
  ...[router, { libraries, queries }]: RouterInitArgs<T>
) {
  // DEV: MFA trusted device management
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const { trustedDevices } = queries;
  const { trustedDevices: trustedDeviceLibrary } = libraries;

  router.get(
    `${accountApiPrefix}/trusted-devices`,
    koaPagination(),
    koaGuard({
      response: accountTrustedDeviceResponseGuard.array(),
      status: [200, 400, 401, 500],
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      assertThat(
        fields.trustedDevice === AccountCenterControlValue.Edit ||
          fields.trustedDevice === AccountCenterControlValue.ReadOnly,
        'account_center.field_not_enabled'
      );
      assertThat(
        scopes.has(UserScope.TrustedDevices),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      const { limit, offset } = ctx.pagination;
      const [currentTrustedDevice, [totalNumber, records]] = await Promise.all([
        trustedDeviceLibrary.validateCredential(ctx, userId),
        trustedDevices.findActiveByUserId(userId, { limit, offset }),
      ]);

      ctx.pagination.totalCount = totalNumber;
      ctx.body = records.map(
        (record) =>
          ({
            ...pick(
              record,
              'id',
              'userAgent',
              'country',
              'city',
              'createdAt',
              'lastUsedAt',
              'expiresAt'
            ),
            isCurrent: record.id === currentTrustedDevice?.id,
          }) satisfies AccountTrustedDeviceResponse
      );

      return next();
    }
  );

  router.delete(
    `${accountApiPrefix}/trusted-devices/:trustedDeviceId`,
    koaGuard({
      params: z.object({ trustedDeviceId: z.string().min(1) }),
      status: [204, 400, 401, 403, 404, 500],
    }),
    async (ctx, next) => {
      const { trustedDeviceId } = ctx.guard.params;
      const { id: userId, scopes, identityVerified, clientId } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );
      assertThat(
        fields.trustedDevice === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );
      assertThat(
        scopes.has(UserScope.TrustedDevices),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      await assertFirstPartyClient(queries, clientId);

      const currentTrustedDevice = await trustedDeviceLibrary.validateCredential(ctx, userId);
      const trustedDevice = await trustedDeviceLibrary.deleteByIdAndUserId(
        ctx,
        trustedDeviceId,
        userId
      );

      assertThat(trustedDevice, new RequestError({ code: 'entity.not_found', status: 404 }));

      if (trustedDevice.id === currentTrustedDevice?.id) {
        trustedDeviceLibrary.clearCredential(ctx, userId);
      }

      ctx.status = 204;

      return next();
    }
  );
}
