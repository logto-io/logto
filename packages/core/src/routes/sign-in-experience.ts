import { ConnectorType, SignInExperiences } from '@logto/schemas';
import { literal, object, string } from 'zod';

import { getLogtoConnectors } from '@/connectors';
import {
  validateBranding,
  validateLanguageInfo,
  validateSignUp,
  validateSignIn,
} from '@/lib/sign-in-experience';
import koaGuard from '@/middleware/koa-guard';
import {
  findDefaultSignInExperience,
  updateDefaultSignInExperience,
} from '@/queries/sign-in-experience';

import type { AuthedRouter } from './types';

export default function signInExperiencesRoutes<T extends AuthedRouter>(router: T) {
  /**
   * As we only support single signInExperience settings for V1
   * always return the default settings in DB for the /sign-in-exp get method
   */
  router.get('/sign-in-exp', async (ctx, next) => {
    ctx.body = await findDefaultSignInExperience();

    return next();
  });

  router.patch(
    '/sign-in-exp',
    koaGuard({
      body: SignInExperiences.createGuard
        .omit({ id: true, termsOfUseUrl: true })
        .merge(
          object({
            termsOfUseUrl: string().url().optional().or(literal('')),
          })
        )
        .partial(),
    }),
    /* eslint-disable complexity */
    async (ctx, next) => {
      const { socialSignInConnectorTargets, ...rest } = ctx.guard.body;
      const { branding, languageInfo, signUp, signIn } = rest;

      if (branding) {
        validateBranding(branding);
      }

      if (languageInfo) {
        await validateLanguageInfo(languageInfo);
      }

      const connectors = await getLogtoConnectors();
      const enabledConnectors = connectors.filter(({ dbEntry: { enabled } }) => enabled);

      // Remove unavailable connectors
      const filteredSocialSignInConnectorTargets = socialSignInConnectorTargets?.filter((target) =>
        enabledConnectors.some(
          (connector) =>
            connector.metadata.target === target && connector.type === ConnectorType.Social
        )
      );

      if (signUp) {
        validateSignUp(signUp, enabledConnectors);
      }

      if (signIn && signUp) {
        validateSignIn(signIn, signUp, enabledConnectors);
      } else if (signIn) {
        const signInExperience = await findDefaultSignInExperience();
        validateSignIn(signIn, signInExperience.signUp, enabledConnectors);
      }
      ctx.body = await updateDefaultSignInExperience(
        filteredSocialSignInConnectorTargets
          ? {
              ...rest,
              socialSignInConnectorTargets: filteredSocialSignInConnectorTargets,
            }
          : rest
      );

      return next();
    }
  );
  /* eslint-enable complexity */
}
