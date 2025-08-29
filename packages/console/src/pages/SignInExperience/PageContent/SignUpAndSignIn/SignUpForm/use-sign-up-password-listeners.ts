import { MfaFactor, type SignInExperience, SignInIdentifier } from '@logto/schemas';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { type SignInExperienceForm } from '@/pages/SignInExperience/types';

/**
 * This hook listens to the password field changes in the sign-up form,
 * and updates the sign-in methods accordingly.
 *
 * - if the password is enabled for sign-up, then it will be enabled for all sign-in methods.
 * - if the password is not required for sign-up, then verification code authentication method is required for email and phone sign-in methods.
 */
const useSignUpPasswordListeners = (signInExperience: SignInExperience) => {
  const {
    control,
    getValues,
    setValue,
    trigger,
    formState: { submitCount },
  } = useFormContext<SignInExperienceForm>();

  const isFirstMount = useRef(true);

  const signUpPassword = useWatch({ control, name: 'signUp.password' });

  // We create a ref to store the submit count
  // to avoid the password update effect to be triggered by the submit count change.
  const submitCountRef = useRef(submitCount);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    submitCountRef.current = submitCount;
  }, [submitCount]);

  useEffect(() => {
    // Only sync the password settings on updates (skip the first mount)
    if (isFirstMount.current) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isFirstMount.current = false;
      return;
    }
    const signInMethods = getValues('signIn.methods');

    setValue(
      'signIn.methods',
      signInMethods.map((method) => {
        if (method.identifier === SignInIdentifier.Username) {
          // No need to mutate the username method
          return method;
        }

        // Check if the identifier is already used in MFA factors
        const mfaFactors = signInExperience.mfa.factors;
        const disabledByMfa =
          (method.identifier === SignInIdentifier.Email &&
            mfaFactors.includes(MfaFactor.EmailVerificationCode)) ||
          (method.identifier === SignInIdentifier.Phone &&
            mfaFactors.includes(MfaFactor.PhoneVerificationCode));

        return {
          ...method,
          // Auto enabled password for all sign-in methods,
          // if the password is enabled for sign-up
          password: method.password || signUpPassword,
          // If password is not required for sign-up,
          // then verification code authentication method is required for email and phone sign-in methods
          verificationCode: signUpPassword
            ? disabledByMfa
              ? false
              : method.verificationCode
            : true,
        };
      }),
      {
        shouldDirty: true,
      }
    );

    // By default, the react-hook-form triggers validation only after the first submit.
    // To keep the form validation behavior consistent, we trigger the validation manually
    // if the form has been submitted at least once.
    if (submitCountRef.current > 0) {
      // Wait for the form re-render before validating the new data.
      setTimeout(() => {
        void trigger('signIn.methods');
      }, 0);
    }
  }, [getValues, setValue, signUpPassword, trigger]);
};

export default useSignUpPasswordListeners;
