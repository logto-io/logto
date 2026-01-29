import { conditional, type Optional } from '@silverhand/essentials';

import { adaptiveMfaNewCountryWindowDays } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class NewCountryRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.NewCountry> {
  async validate(
    state: AdaptiveMfaEvaluationState
  ): Promise<Optional<TriggeredRuleByRule<AdaptiveMfaRule.NewCountry>>> {
    const currentCountry = state.context?.location?.country;
    if (!currentCountry) {
      return;
    }

    if (state.user.lastSignInAt === null) {
      return;
    }

    const recentCountries = await this.dependencies.getRecentCountries(state.user);
    const normalizedCurrent = currentCountry.toUpperCase();
    const hasRecentVisit = recentCountries.some(
      ({ country }) => country.toUpperCase() === normalizedCurrent
    );

    if (hasRecentVisit) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.NewCountry,
      details: {
        currentCountry,
        windowDays: adaptiveMfaNewCountryWindowDays,
        recentCountries: conditional(recentCountries.length > 0 && recentCountries),
      },
    };
  }
}
