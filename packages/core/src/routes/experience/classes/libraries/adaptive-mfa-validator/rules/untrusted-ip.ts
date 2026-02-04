import type { Optional } from '@silverhand/essentials';

import type { AdaptiveMfaEvaluationState, IpRiskSignals, TriggeredRuleByRule } from '../types.js';
import { AdaptiveMfaRule } from '../types.js';

import { AdaptiveMfaRuleValidator } from './base-rule.js';

const cleanIpRiskSignals = (signals: IpRiskSignals): IpRiskSignals => ({
  ...(signals.botScore !== undefined && { botScore: signals.botScore }),
  ...(signals.botVerified !== undefined && { botVerified: signals.botVerified }),
});

export class UntrustedIpRule extends AdaptiveMfaRuleValidator<AdaptiveMfaRule.UntrustedIp> {
  async validate(
    state: AdaptiveMfaEvaluationState
  ): Promise<Optional<TriggeredRuleByRule<AdaptiveMfaRule.UntrustedIp>>> {
    const signals = state.context?.ipRiskSignals;
    if (!signals) {
      return;
    }

    const hasRiskSignal = typeof signals.botScore === 'number' || signals.botVerified !== undefined;

    if (!hasRiskSignal) {
      return;
    }

    const matchedSignals: string[] = [];

    if (typeof signals.botScore === 'number' && signals.botScore < state.thresholds.minBotScore) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      matchedSignals.push(`botScore<${state.thresholds.minBotScore}`);
    }

    if (signals.botVerified === true) {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      matchedSignals.push('botVerified');
    }

    if (matchedSignals.length === 0) {
      return;
    }

    return {
      rule: AdaptiveMfaRule.UntrustedIp,
      details: {
        signals: cleanIpRiskSignals(signals),
        matchedSignals,
      },
    };
  }
}
