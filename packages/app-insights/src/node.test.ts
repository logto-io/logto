import type { TelemetryClient } from 'applicationinsights';
import { type EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts/index.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

type TelemetryProcessor = Parameters<TelemetryClient['addTelemetryProcessor']>[0];
type RequestTelemetryEnvelope = EnvelopeTelemetry & {
  data: {
    baseType: string;
    baseData: {
      url: string;
      properties?: Record<string, string | undefined>;
    };
  };
};

const mockAppInsights = vi.hoisted(() => {
  const addTelemetryProcessor = vi.fn();

  return {
    addTelemetryProcessor,
    applicationinsights: {
      defaultClient: {
        context: {
          keys: { cloudRole: 'ai.cloud.role' },
          tags: {},
        },
        addTelemetryProcessor,
        trackException: vi.fn(),
      },
      setup: vi.fn(() => true),
      start: vi.fn(),
    },
  };
});

vi.mock('applicationinsights', () => ({
  default: mockAppInsights.applicationinsights,
}));

const createRequestEnvelope = (): RequestTelemetryEnvelope =>
  ({
    data: {
      baseType: 'RequestData',
      baseData: {
        url: 'http://azure-service.local/api/callback?foo=bar',
        properties: {
          existing: 'value',
        },
      },
    },
  }) as unknown as RequestTelemetryEnvelope;

const setupAppInsights = async () => {
  vi.stubEnv(
    'APPLICATIONINSIGHTS_CONNECTION_STRING',
    'InstrumentationKey=00000000-0000-0000-0000-000000000000'
  );
  const { appInsights } = await import('./node.js');
  await appInsights.setup('core');

  return mockAppInsights.addTelemetryProcessor.mock.calls[0]?.[0] as TelemetryProcessor;
};

describe('appInsights', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should add forwarded headers to auto-collected request telemetry properties', async () => {
    const processor = await setupAppInsights();
    const envelope = createRequestEnvelope();

    processor(envelope, {
      'http.ServerRequest': {
        headers: {
          'x-forwarded-for': '192.0.2.1',
          'x-forwarded-host': 'tenant.logto.app',
          'x-forwarded-proto': 'https',
        },
      },
    });

    expect(envelope.data.baseData).toStrictEqual({
      url: 'http://azure-service.local/api/callback?foo=bar',
      properties: {
        existing: 'value',
        xForwardedFor: '192.0.2.1',
        xForwardedHost: 'tenant.logto.app',
        xForwardedProto: 'https',
      },
    });
  });

  it('should use the first forwarded header value', async () => {
    const processor = await setupAppInsights();
    const envelope = createRequestEnvelope();

    processor(envelope, {
      'http.ServerRequest': {
        headers: {
          'x-forwarded-for': '192.0.2.1, 198.51.100.1',
          'x-forwarded-host': 'tenant.logto.app, azure-service.local',
          'x-forwarded-proto': 'https, http',
        },
      },
    });

    expect(envelope.data.baseData.properties).toStrictEqual({
      existing: 'value',
      xForwardedFor: '192.0.2.1',
      xForwardedHost: 'tenant.logto.app',
      xForwardedProto: 'https',
    });
  });

  it('should add partial forwarded headers', async () => {
    const processor = await setupAppInsights();
    const envelope = createRequestEnvelope();

    processor(envelope, {
      'http.ServerRequest': {
        headers: {
          'x-forwarded-for': '192.0.2.1',
          'x-forwarded-proto': 'https',
        },
      },
    });

    expect(envelope.data.baseData.properties).toStrictEqual({
      existing: 'value',
      xForwardedFor: '192.0.2.1',
      xForwardedProto: 'https',
    });
  });
});
