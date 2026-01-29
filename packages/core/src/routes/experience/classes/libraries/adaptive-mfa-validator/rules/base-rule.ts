import type { User, UserGeoLocation } from '@logto/schemas';
import type { Nullable, Optional } from '@silverhand/essentials';

import type { AdaptiveMfaEvaluationState, RecentCountry, TriggeredRule } from '../types.js';

export type RuleDependencies = {
  getRecentCountries: (user: User) => Promise<RecentCountry[]>;
  getUserGeoLocation: (user: User) => Promise<Nullable<UserGeoLocation>>;
};

export abstract class AdaptiveMfaRuleValidator {
  constructor(protected readonly dependencies: RuleDependencies) {}

  abstract validate(state: AdaptiveMfaEvaluationState): Promise<Optional<TriggeredRule>>;
}
