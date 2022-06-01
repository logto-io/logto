import { ConnectorMetadata } from '@logto/connector-types';
import etag from 'etag';

import { getConnectorInstances } from '@/connectors';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';

import { AnonymousRouter } from './types';

export default function signInSettingsRoutes<T extends AnonymousRouter>(router: T) {
  router.get(
    '/sign-in-settings',
    async (ctx, next) => {
      const [signInExperience, connectorInstances] = await Promise.all([
        findDefaultSignInExperience(),
        getConnectorInstances(),
      ]);
      const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
        Array<ConnectorMetadata & { id: string }>
      >((previous, connectorTarget) => {
        const connectors = connectorInstances.filter(
          ({ metadata: { target }, connector: { enabled } }) =>
            target === connectorTarget && enabled
        );

        return [
          ...previous,
          ...connectors.map(({ metadata, connector: { id } }) => ({ ...metadata, id })),
        ];
      }, []);
      ctx.body = { ...signInExperience, socialConnectors };

      return next();
    },
    async (ctx, next) => {
      await next();

      ctx.response.etag = etag(JSON.stringify(ctx.body));

      if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
      }
    }
  );
}
