import { ConnectorType } from '@logto/schemas';

import {
  mockMetadata0,
  mockConnector0,
  mockLogtoConnector,
  mockLogtoConnectorList,
  mockConnector1,
  mockMetadata1,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { checkSocialConnectorTargetAndPlatformUniqueness } from './platform.js';
import { type LogtoConnector } from './types.js';

describe('check social connector target and platform uniqueness', () => {
  it('throws if more than one same-platform social connectors sharing the same `target`', () => {
    const mockConnectors: LogtoConnector[] = [
      {
        dbEntry: mockConnector0,
        metadata: { ...mockMetadata0, target: 'target' },
        type: ConnectorType.Social,
        ...mockLogtoConnector,
      },
      {
        dbEntry: mockConnector1,
        metadata: { ...mockMetadata1, target: 'target' },
        type: ConnectorType.Social,
        ...mockLogtoConnector,
      },
    ];
    expect(() => {
      checkSocialConnectorTargetAndPlatformUniqueness(mockConnectors);
    }).toMatchError(
      new RequestError({
        code: 'connector.multiple_target_with_same_platform',
        status: 400,
      })
    );
  });

  it('should not throw when no multiple connectors sharing same target and platform', () => {
    expect(() => {
      checkSocialConnectorTargetAndPlatformUniqueness(mockLogtoConnectorList);
    }).not.toThrow();
  });
});
