import { InteractionEvent, type User, type UserGeoLocation } from '@logto/schemas';
import { conditional, type Nullable, type Optional, trySafe } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { getInjectedHeaderValues } from '#src/utils/injected-header-mapping.js';

import type { SignInExperienceValidator } from '../sign-in-experience-validator.js';

import { adaptiveMfaNewCountryWindowDays } from './constants.js';
import { parseAdaptiveMfaContext } from './context.js';
import type { AdaptiveMfaRuleValidator, RuleDependencies } from './rules/base-rule.js';
import { GeoVelocityRule } from './rules/geo-velocity.js';
import { LongInactivityRule } from './rules/long-inactivity.js';
import { NewCountryRule } from './rules/new-country.js';
import { UntrustedIpRule } from './rules/untrusted-ip.js';
import type {
  AdaptiveMfaContext,
  AdaptiveMfaEvaluationOptions,
  AdaptiveMfaEvaluationState,
  AdaptiveMfaRule,
  AdaptiveMfaResult,
  AdaptiveMfaValidatorContext,
  AdaptiveMfaValidatorOptions,
  RecentCountry,
  TriggeredRule,
} from './types.js';

export { adaptiveMfaNewCountryWindowDays } from './constants.js';

export class AdaptiveMfaValidator {
  private readonly queries: Pick<Queries, 'userGeoLocations' | 'userSignInCountries'>;
  private readonly signInExperienceValidator: SignInExperienceValidator;
  private readonly ctx?: AdaptiveMfaValidatorContext;
  private readonly recentCountriesCache = new Map<string, RecentCountry[]>();
  private readonly ruleValidators: Array<AdaptiveMfaRuleValidator<AdaptiveMfaRule>>;

  private readonly userGeoLocationCache = new Map<string, Nullable<UserGeoLocation>>();

  private signInContext?: Record<string, string>;
  private adaptiveMfaContext?: AdaptiveMfaContext;
  private isAdaptiveMfaEnabledCache?: boolean;

  constructor({ queries, signInExperienceValidator, ctx }: AdaptiveMfaValidatorOptions) {
    this.queries = queries;
    this.signInExperienceValidator = signInExperienceValidator;
    this.ctx = ctx;

    const ruleDependencies: RuleDependencies = {
      getRecentCountries: async (user: User) => this.getRecentCountries(user),
      getUserGeoLocation: async (user: User) => this.getUserGeoLocation(user),
    };

    this.ruleValidators = [
      new NewCountryRule(ruleDependencies),
      new GeoVelocityRule(ruleDependencies),
      new LongInactivityRule(ruleDependencies),
      new UntrustedIpRule(ruleDependencies),
    ];
  }

  /**
   * @remarks Record geo context on sign-in event only.
   */
  public async recordSignInGeoContext(user: User, interactionEvent: InteractionEvent) {
    if (interactionEvent !== InteractionEvent.SignIn) {
      return;
    }

    await this.persistContext(user);
  }

  public async getResult(
    user: User,
    options: AdaptiveMfaEvaluationOptions = {}
  ): Promise<Optional<AdaptiveMfaResult>> {
    if (!(await this.isAdaptiveMfaEnabled())) {
      return;
    }

    const state = this.buildEvaluationState(user, options);
    return this.evaluateRules(state);
  }

  public async persistContext(user: User, options: AdaptiveMfaEvaluationOptions = {}) {
    if (!(await this.isAdaptiveMfaEnabled())) {
      return;
    }

    const context = this.getCurrentContext(options.currentContext);
    if (!context) {
      return;
    }

    const { location } = context;
    if (!location) {
      return;
    }

    const { latitude, longitude, country } = location;
    const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

    const tasks = [
      ...(hasCoordinates
        ? [this.queries.userGeoLocations.upsertUserGeoLocation(user.id, latitude, longitude)]
        : []),
      this.queries.userSignInCountries.upsertUserSignInCountry(user.id, country),
      trySafe(async () =>
        this.queries.userSignInCountries.pruneUserSignInCountriesByUserId(
          user.id,
          adaptiveMfaNewCountryWindowDays
        )
      ),
    ];

    await Promise.all(tasks);
  }

  public getCurrentContext(contextOverride?: AdaptiveMfaContext): Optional<AdaptiveMfaContext> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    if (contextOverride !== undefined) {
      return contextOverride;
    }

    if (this.adaptiveMfaContext) {
      return this.adaptiveMfaContext;
    }

    const context = parseAdaptiveMfaContext(this.getSignInContext());

    this.adaptiveMfaContext = context;
    return this.adaptiveMfaContext;
  }

  public getSignInContext(): Optional<Record<string, string>> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    if (this.signInContext) {
      return this.signInContext;
    }

    this.signInContext = conditional(this.ctx && getInjectedHeaderValues(this.ctx.request.headers));
    return this.signInContext;
  }

  private buildEvaluationState(
    user: User,
    options: AdaptiveMfaEvaluationOptions
  ): AdaptiveMfaEvaluationState {
    return {
      user,
      now: options.now ?? new Date(),
      context: this.getCurrentContext(options.currentContext),
    };
  }

  private async evaluateRules(state: AdaptiveMfaEvaluationState): Promise<AdaptiveMfaResult> {
    const triggeredRules = new Set<TriggeredRule>();
    for (const ruleValidator of this.ruleValidators) {
      // eslint-disable-next-line no-await-in-loop
      const triggeredRule = await ruleValidator.validate(state);
      if (triggeredRule) {
        triggeredRules.add(triggeredRule);
      }
    }

    const triggeredRulesList = Array.from(triggeredRules);

    return {
      requiresMfa: triggeredRulesList.length > 0,
      triggeredRules: triggeredRulesList,
    };
  }

  private async getRecentCountries(user: User) {
    if (this.recentCountriesCache.has(user.id)) {
      return this.recentCountriesCache.get(user.id) ?? [];
    }

    const recentCountries =
      await this.queries.userSignInCountries.findRecentSignInCountriesByUserId(
        user.id,
        adaptiveMfaNewCountryWindowDays
      );
    this.recentCountriesCache.set(user.id, recentCountries);
    return recentCountries;
  }

  private async getUserGeoLocation(user: User) {
    if (this.userGeoLocationCache.has(user.id)) {
      return this.userGeoLocationCache.get(user.id) ?? null;
    }

    const geoLocation = await this.queries.userGeoLocations.findUserGeoLocationByUserId(user.id);
    this.userGeoLocationCache.set(user.id, geoLocation);
    return geoLocation;
  }

  private async isAdaptiveMfaEnabled(): Promise<Optional<boolean>> {
    if (!EnvSet.values.isDevFeaturesEnabled) {
      return;
    }

    if (this.isAdaptiveMfaEnabledCache !== undefined) {
      return this.isAdaptiveMfaEnabledCache;
    }

    const { adaptiveMfa } = await this.signInExperienceValidator.getSignInExperienceData();
    this.isAdaptiveMfaEnabledCache = adaptiveMfa.enabled;

    return this.isAdaptiveMfaEnabledCache;
  }
}
