import { ConnectorType } from '@logto/schemas';

import {
  mockMetadata0,
  mockMetadata1,
  mockConnector0,
  mockConnector1,
  mockLogtoConnector,
  mockLogtoConnectorList,
} from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { checkSocialConnectorTargetAndPlatformUniqueness } from './platform.js';

describe('check social connector target and platform uniqueness', () => {
  it('throws if more than one same-platform social connectors sharing the same `target`', () => {
    const mockConnectors = [
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
