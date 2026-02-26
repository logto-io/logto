import { InteractionEvent } from '@logto/schemas';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionContext } from '../types.js';

import { type AdaptiveMfaResult } from './libraries/adaptive-mfa-validator/types.js';
import { Mfa } from './mfa.js';

const { jest } = import.meta;

const createMfa = () => {
  const interactionContext: InteractionContext = {
    getInteractionEvent: () => InteractionEvent.SignIn,
    getIdentifiedUser: async () => {
      throw new Error('should not be called');
    },
    getVerificationRecordById: () => {
      throw new Error('should not be called');
    },
    getVerificationRecordByTypeAndId: () => {
      throw new Error('should not be called');
    },
    getCurrentProfile: () => ({}),
  };

  return new Mfa({} as Libraries, {} as Queries, {}, interactionContext);
};

describe('Mfa.assertSubmitMfaFulfilled', () => {
  it('runs adaptive binding check before mandatory check for sign-in', async () => {
    const mfa = createMfa();
    const adaptiveMfaResult: AdaptiveMfaResult = {
      requiresMfa: true,
      triggeredRules: [],
    };

    const adaptiveSpy = jest.spyOn(mfa, 'assertAdaptiveMfaBindingFulfilled').mockResolvedValue();
    const mandatorySpy = jest.spyOn(mfa, 'assertUserMandatoryMfaFulfilled').mockResolvedValue();

    await mfa.assertSubmitMfaFulfilled({
      interactionEvent: InteractionEvent.SignIn,
      adaptiveMfaResult,
    });

    expect(adaptiveSpy).toHaveBeenCalledWith(adaptiveMfaResult);
    expect(mandatorySpy).toHaveBeenCalledTimes(1);
    expect(adaptiveSpy.mock.invocationCallOrder[0]).toBeLessThan(
      mandatorySpy.mock.invocationCallOrder[0]!
    );
  });

  it('skips adaptive binding check for non-sign-in events', async () => {
    const mfa = createMfa();

    const adaptiveSpy = jest.spyOn(mfa, 'assertAdaptiveMfaBindingFulfilled').mockResolvedValue();
    const mandatorySpy = jest.spyOn(mfa, 'assertUserMandatoryMfaFulfilled').mockResolvedValue();

    await mfa.assertSubmitMfaFulfilled({
      interactionEvent: InteractionEvent.Register,
    });

    expect(adaptiveSpy).not.toHaveBeenCalled();
    expect(mandatorySpy).toHaveBeenCalledTimes(1);
  });
});
