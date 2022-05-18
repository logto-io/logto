import { ConnectorMetadata } from '@logto/connector-types';

import { getConnectorInstances } from '@/connectors';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';

import { AnonymousRouter } from './types';

export default function signInSettingsRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/sign-in-settings', async (ctx, next) => {
    const signInExperience = await findDefaultSignInExperience();
    const connectorInstances = await getConnectorInstances();
    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      Array<ConnectorMetadata & { id: string }>
    >((previous, connectorTarget) => {
      const connectors = connectorInstances.filter(
        ({ metadata: { target } }) => target === connectorTarget
      );

      return [
        ...previous,
        ...connectors.map(({ metadata, connector: { id } }) => ({ ...metadata, id })),
      ];
    }, []);
    ctx.body = { ...signInExperience, socialConnectors };

    return next();
  });
}
