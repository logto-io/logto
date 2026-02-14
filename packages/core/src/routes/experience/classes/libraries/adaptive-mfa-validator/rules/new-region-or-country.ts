import { conditional, type Optional } from '@silverhand/essentials';

import { adaptiveMfaRegionOrCountryWindowDays } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';
import { toRecentRegionOrCountry } from '../utils.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class NewRegionOrCountryRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.NewRegionOrCountry> {
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

    const recentRegionsOrCountries = await this.dependencies.getRecentRegionsOrCountries(
      state.user
    );
    const normalizedCurrent = currentRegionOrCountry.toUpperCase();
    const hasRecentVisit = recentRegionsOrCountries.some(
      ({ country }) => country.toUpperCase() === normalizedCurrent
    );

    if (hasRecentVisit) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.NewRegionOrCountry,
      details: {
        currentRegionOrCountry,
        windowDays: adaptiveMfaRegionOrCountryWindowDays,
        recentRegionsOrCountries: conditional(
          recentRegionsOrCountries.length > 0 &&
            recentRegionsOrCountries.map((recentRegionOrCountry) =>
              toRecentRegionOrCountry(recentRegionOrCountry)
            )
        ),
      },
    };
  }
}
