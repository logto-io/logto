import type { Optional } from '@silverhand/essentials';

import { adaptiveMfaLongInactivityThresholdDays, msPerDay } from '../constants.js';
import type { AdaptiveMfaEvaluationState, TriggeredRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';
import { roundTo } from '../utils.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

export class LongInactivityRule extends AdaptiveMfaRuleValidator {
  async validate(state: AdaptiveMfaEvaluationState): Promise<Optional<TriggeredRule>> {
    if (state.user.lastSignInAt === null) {
      return;
    }

    const inactivityDays = (state.now.getTime() - state.user.lastSignInAt) / msPerDay;

    if (inactivityDays <= adaptiveMfaLongInactivityThresholdDays) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.LongInactivity,
      details: {
        lastSignInAt: new Date(state.user.lastSignInAt).toISOString(),
        inactivityDays: roundTo(inactivityDays),
        thresholdDays: adaptiveMfaLongInactivityThresholdDays,
      },
    };
  }
}
