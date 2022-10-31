import { SignUpIdentifier } from '@logto/schemas';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';

import type { SignInExperienceForm } from '../../types';
import SignInMethodEditBox from './components/SignInMethodEditBox';
import { signUpToSignInIdentifierMapping } from './constants';
import * as styles from './index.module.scss';

const SignInForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { control } = useFormContext<SignInExperienceForm>();
  /**
   * Note: `watch` may not return the default value, use `useWatch` instead.
   * Reference: https://github.com/react-hook-form/react-hook-form/issues/1332
   */
  const signUpIdentifier = useWatch({
    control,
    name: 'signUp.identifier',
    defaultValue: SignUpIdentifier.Username,
  });

  const requirePassword = useWatch({ control, name: 'signUp.password', defaultValue: false });
  const requireVerificationCode = useWatch({ control, name: 'signUp.verify', defaultValue: false });

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.sign_up_and_sign_in.sign_in.title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </div>
        <Controller
          control={control}
          name="signIn.methods"
          defaultValue={[]}
          render={({ field: { value, onChange } }) => {
            return (
              <SignInMethodEditBox
                value={value}
                requiredSignInIdentifiers={signUpToSignInIdentifierMapping[signUpIdentifier]}
                isPasswordRequired={requirePassword}
                isVerificationRequired={requireVerificationCode}
                onChange={onChange}
              />
            );
          }}
        />
      </FormField>
    </>
  );
};

export default SignInForm;
