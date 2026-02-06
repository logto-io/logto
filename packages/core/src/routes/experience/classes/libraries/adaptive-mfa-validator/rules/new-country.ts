import { conditional, type Optional } from '@silverhand/essentials';

import { adaptiveMfaNewCountryWindowDays } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';
import { toRecentRegionOrCountry } from '../utils.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class NewCountryRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.NewRegionOrCountry> {
  async validate(
    state: AdaptiveMfaEvaluationState
  ): Promise<Optional<TriggeredRuleByRule<AdaptiveMfaRule.NewRegionOrCountry>>> {
    const currentRegionOrCountry = state.context?.location?.regionOrCountry;
    if (!currentRegionOrCountry) {
      return;
    }

    if (state.user.lastSignInAt === null) {
      return;
    }

    const recentCountries = await this.dependencies.getRecentCountries(state.user);
    const normalizedCurrent = currentRegionOrCountry.toUpperCase();
    const hasRecentVisit = recentCountries.some(
      ({ country }) => country.toUpperCase() === normalizedCurrent
    );

    if (hasRecentVisit) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.NewRegionOrCountry,
      details: {
        currentRegionOrCountry,
        windowDays: adaptiveMfaNewCountryWindowDays,
        recentRegionsOrCountries: conditional(
          recentCountries.length > 0 &&
            recentCountries.map((recentCountry) => toRecentRegionOrCountry(recentCountry))
        ),
      },
    };
  }
}
