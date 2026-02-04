import type { Optional } from '@silverhand/essentials';

import { msPerDay } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';
import { roundTo } from '../utils.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class LongInactivityRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.LongInactivity> {
  async validate(
    state: AdaptiveMfaEvaluationState
  ): Promise<Optional<TriggeredRuleByRule<AdaptiveMfaRule.LongInactivity>>> {
    if (state.user.lastSignInAt === null) {
      return;
    }

    const inactivityDays = (state.now.getTime() - state.user.lastSignInAt) / msPerDay;

    if (inactivityDays <= state.thresholds.longInactivityDays) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.LongInactivity,
      details: {
        lastSignInAt: new Date(state.user.lastSignInAt).toISOString(),
        inactivityDays: roundTo(inactivityDays),
        thresholdDays: state.thresholds.longInactivityDays,
      },
    };
  }
}
