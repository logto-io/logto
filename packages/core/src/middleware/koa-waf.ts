import { inspectRequest, type WafFinding, type WafOptions, type WafRuleId } from '@logto/waf';
import type Koa from 'koa';

import { getConsoleLogFromContext } from '#src/utils/console.js';

export type KoaWafEvent = {
  readonly requestId: string;
  readonly method: string;
  readonly ruleId: WafRuleId;
  readonly mode: 'report' | 'block';
  readonly targetLength: number;
};

// eslint-disable-next-line import/no-unused-modules
export type KoaWafRuntimeConfig = {
  readonly mode: 'off' | 'report' | 'block';
  readonly maxRequestTargetLength: number;
};

export type KoaWafOptions = {
  readonly mode?: 'off' | 'report' | 'block';
  readonly getConfig?: () => Promise<KoaWafRuntimeConfig>;
  readonly inspect?: typeof inspectRequest;
  readonly inspectorOptions?: WafOptions;
  readonly report?: (event: KoaWafEvent) => void | Promise<void>;
};

const blockedBody = { code: 'request.blocked', message: 'Request blocked.' };

const getRequestId = (context: Record<string, unknown>) => {
  if ('requestId' in context && typeof context.requestId === 'string') {
    return context.requestId;
  }

  return '';
};

const buildEvent = (
  context: Koa.Context,
  finding: WafFinding,
  mode: 'report' | 'block',
  targetLength: number
): KoaWafEvent => ({
  requestId: getRequestId(context),
  method: context.method,
  ruleId: finding.ruleId,
  mode,
  targetLength,
});

export default function koaWaf({
  mode = 'report',
  getConfig,
  inspect = inspectRequest,
  inspectorOptions,
  report,
}: KoaWafOptions): Koa.Middleware {
  return async (context, next) => {
    const rawTarget = context.req.url ?? context.originalUrl;

    try {
      const runtimeConfig = getConfig
        ? await getConfig()
        : {
            mode,
            maxRequestTargetLength: inspectorOptions?.maxRequestTargetLength ?? 8192,
          };
      if (runtimeConfig.mode === 'off') {
        await next();
        return;
      }
      const activeMode = runtimeConfig.mode;

      const findings = inspect(
        {
          method: context.method,
          rawTarget,
          headers: {
            'content-length': context.headers['content-length'],
            'transfer-encoding': context.headers['transfer-encoding'],
          },
          rawHeaders: context.req.rawHeaders,
        },
        {
          ...inspectorOptions,
          maxRequestTargetLength: runtimeConfig.maxRequestTargetLength,
        }
      );

      const reportFinding =
        report ??
        ((event: KoaWafEvent) => {
          getConsoleLogFromContext(context).warn('WAF request finding', event);
        });
      await Promise.all(
        findings.map(async (finding) =>
          reportFinding(buildEvent(context, finding, activeMode, rawTarget.length))
        )
      );

      if (activeMode === 'block' && findings.length > 0) {
        // Koa exposes response status and body through mutable context properties.
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.status = 403;
        // eslint-disable-next-line @silverhand/fp/no-mutation
        context.body = blockedBody;
        return;
      }
    } catch {
      return next();
    }

    return next();
  };
}
