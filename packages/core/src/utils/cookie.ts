import { logtoUiCookieGuard, logtoCookieKey } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { type Context } from 'koa';

export const getLogtoCookie = (ctx: Context) =>
  trySafe(() => logtoUiCookieGuard.parse(JSON.parse(ctx.cookies.get(logtoCookieKey) ?? '{}'))) ??
  {};
