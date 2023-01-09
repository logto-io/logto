import { ConnectorType } from '@logto/schemas';

import assertThat from '#src/utils/assert-that.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

export const checkSocialConnectorTargetAndPlatformUniqueness = (connectors: LogtoConnector[]) => {
  const targetAndPlatformObjectsInUse = connectors
    .filter(({ type }) => type === ConnectorType.Social)
    .map(({ metadata: { target, platform } }) => ({
      target,
      platform,
    }));

  const targetAndPlatformSet = new Set<string>();

  for (const targetAndPlatformObject of targetAndPlatformObjectsInUse) {
    const { target, platform } = targetAndPlatformObject;

    if (platform === null) {
      continue;
    }

    const element = JSON.stringify([target, platform]);
    assertThat(!targetAndPlatformSet.has(element), 'connector.multiple_target_with_same_platform');
    targetAndPlatformSet.add(element);
  }
};
