import type { User, UserGeoLocation } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';

import type {
  AdaptiveMfaEvaluationState,
  AdaptiveMfaRule,
  RecentRegionOrCountrySource,
  TriggeredRuleByRule,
} from '../types.js';

export type RuleDependencies = {
  getRecentRegionsOrCountries: (user: User) => Promise<RecentRegionOrCountrySource[]>;
  getUserGeoLocation: (user: User) => Promise<Nullable<UserGeoLocation>>;
};

export abstract class AdaptiveMfaRuleValidator<R extends AdaptiveMfaRule> {
  constructor(protected readonly dependencies: RuleDependencies) {}

  abstract validate(state: AdaptiveMfaEvaluationState): Promise<Optional<TriggeredRuleByRule<R>>>;
}
