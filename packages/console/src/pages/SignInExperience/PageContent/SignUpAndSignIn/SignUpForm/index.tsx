import { SignInIdentifier, type SignInExperience } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';

import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

import SignUpIdentifiersEditBox from './SignUpIdentifiersEditBox';
import styles from './index.module.scss';
import useSignUpPasswordListeners from './use-sign-up-password-listeners';

type Props = {
  readonly signInExperience: SignInExperience;
};

function SignUpForm({ signInExperience }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { control, setValue } = useFormContext<SignInExperienceForm>();

  const signUpIdentifiers = useWatch({
    control,
    name: 'signUp.identifiers',
  });

  const signUpVerify = useWatch({
    control,
    name: 'signUp.verify',
  });

  const showAuthenticationFields = useMemo(
    () => signUpIdentifiers.length > 0,
    [signUpIdentifiers.length]
  );

  useEffect(() => {
    if (signUpIdentifiers.length === 0) {
      setValue('signUp.password', false, { shouldDirty: true });
    }

    /**
     * If username is added and as the only identifier, check "Create your password" option.
     * If username is added but there's already other identifiers, the "Create your password"
     * option should also be checked, but is handled in the sub-component. @see SignUpIdentifiersEditBox
     */
    if (
      signUpIdentifiers.length === 1 &&
      signUpIdentifiers[0]?.identifier === SignInIdentifier.Username
    ) {
      setValue('signUp.password', true, { shouldDirty: true });
    }

    const isSignUpVerify = signUpIdentifiers.some(
      ({ identifier }) => identifier !== SignInIdentifier.Username
    );
    setValue('signUp.verify', isSignUpVerify, { shouldDirty: true });
  }, [setValue, signUpIdentifiers]);

  useSignUpPasswordListeners(signInExperience);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_up.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_identifier">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_up.identifier_description')}
        </FormFieldDescription>
        <SignUpIdentifiersEditBox signInExperience={signInExperience} />
      </FormField>
      {showAuthenticationFields && (
        <FormField title="sign_in_exp.sign_up_and_sign_in.sign_up.sign_up_authentication">
          <FormFieldDescription>
            {t('sign_in_exp.sign_up_and_sign_in.sign_up.authentication_description')}
          </FormFieldDescription>
          <div className={styles.selections}>
            <Controller
              name="signUp.password"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={t('sign_in_exp.sign_up_and_sign_in.sign_up.set_a_password_option')}
                  checked={value}
                  onChange={onChange}
                />
              )}
            />
            {signUpVerify && (
              <Controller
                name="signUp.verify"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    disabled
                    label={t('sign_in_exp.sign_up_and_sign_in.sign_up.verify_at_sign_up_option')}
                    checked={value}
                    suffixTooltip={t('sign_in_exp.sign_up_and_sign_in.sign_up.verification_tip')}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </div>
        </FormField>
      )}
    </Card>
  );
}

export default SignUpForm;
