export type WafRuleId =
  | 'unsupported-method'
  | 'ambiguous-body-framing'
  | 'request-target-too-long'
  | 'request-target-control-character'
  | 'path-traversal';

export type WafRequest = {
  readonly method: string;
  readonly rawTarget: string;
  readonly headers: Readonly<Record<string, string | readonly string[] | undefined>>;
  readonly rawHeaders?: readonly string[];
};

export type WafOptions = {
  readonly maxRequestTargetLength?: number;
};

export type WafFinding = {
  readonly ruleId: WafRuleId;
};

const defaultMaxRequestTargetLength = 8192;
const unsupportedMethods = new Set(['TRACE', 'TRACK', 'CONNECT']);
const encodedControl = /%(?:00|0a|0d)/i;
const literalControl = /[\0\n\r]/;

const getHeaderValues = (headers: WafRequest['headers'], name: string): readonly string[] =>
  Object.entries(headers).flatMap(([key, value]) => {
    if (key.toLowerCase() !== name || value === undefined) {
      return [];
    }

    return typeof value === 'string' ? [value] : value;
  });

const getRawHeaderValues = (rawHeaders: readonly string[] | undefined, name: string) => {
  if (!rawHeaders) {
    return [];
  }

  return rawHeaders.flatMap((value, index) =>
    index % 2 === 0 && value.toLowerCase() === name ? [rawHeaders[index + 1] ?? ''] : []
  );
};

const hasAmbiguousBodyFraming = ({ headers, rawHeaders }: WafRequest) => {
  const contentLengths = rawHeaders
    ? getRawHeaderValues(rawHeaders, 'content-length')
    : getHeaderValues(headers, 'content-length');
  const transferEncodings = rawHeaders
    ? getRawHeaderValues(rawHeaders, 'transfer-encoding')
    : getHeaderValues(headers, 'transfer-encoding');

  if (contentLengths.length > 0 && transferEncodings.length > 0) {
    return true;
  }

  return new Set(contentLengths.map((value) => value.trim())).size > 1;
};

const decodePath = (path: string) =>
  path.replaceAll(/%([\dA-Fa-f]{2})/g, (_, hex: string) =>
    String.fromCodePoint(Number.parseInt(hex, 16))
  );

const hasTraversal = (rawTarget: string) => {
  const pathname = rawTarget.split('?', 1)[0] ?? '';
  const decodedOnce = decodePath(pathname);
  const decodedTwice = decodePath(decodedOnce);

  return [pathname, decodedOnce, decodedTwice].some((path) => path.split('/').includes('..'));
};

export const inspectRequest = (
  request: WafRequest,
  options: WafOptions = {}
): readonly WafFinding[] => {
  const findings = new Set<WafRuleId>();

  if (unsupportedMethods.has(request.method.toUpperCase())) {
    findings.add('unsupported-method');
  }
  if (hasAmbiguousBodyFraming(request)) {
    findings.add('ambiguous-body-framing');
  }
  if (
    request.rawTarget.length > (options.maxRequestTargetLength ?? defaultMaxRequestTargetLength)
  ) {
    findings.add('request-target-too-long');
  }
  if (literalControl.test(request.rawTarget) || encodedControl.test(request.rawTarget)) {
    findings.add('request-target-control-character');
  }
  if (hasTraversal(request.rawTarget)) {
    findings.add('path-traversal');
  }

  return [...findings].map((ruleId) => ({ ruleId }));
};
