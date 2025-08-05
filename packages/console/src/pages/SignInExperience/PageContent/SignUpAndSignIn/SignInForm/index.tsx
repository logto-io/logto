import type { SignInExperience } from '@logto/schemas';
import { ForgotPasswordMethod, ConnectorType } from '@logto/schemas';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

import ForgotPasswordMethodEditBox from './ForgotPasswordMethodEditBox';
import SignInMethodEditBox from './SignInMethodEditBox';

type Props = {
  readonly signInExperience: SignInExperience;
};

function SignInForm({ signInExperience }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, setValue } = useFormContext<SignInExperienceForm>();
  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const signInMethods = watch('signIn.methods');
  const forgotPasswordMethods = watch('forgotPasswordMethods');
  const hasPasswordMethod = signInMethods.some((method) => method.password);

  useEffect(() => {
    if (!isDevFeaturesEnabled) {
      return;
    }

    // If there is no password method, we should clear the forgot password methods.
    if (!hasPasswordMethod) {
      setValue('forgotPasswordMethods', []);
    } else if (!forgotPasswordMethods) {
      // If this is null, we should initialize it based on current connector setup
      // if has email connector, then add email verification code method, also for sms connector
      const initialMethods = [
        ...(isConnectorTypeEnabled(ConnectorType.Email)
          ? [ForgotPasswordMethod.EmailVerificationCode]
          : []),
        ...(isConnectorTypeEnabled(ConnectorType.Sms)
          ? [ForgotPasswordMethod.PhoneVerificationCode]
          : []),
      ];

      setValue('forgotPasswordMethods', initialMethods);
    }
  }, [hasPasswordMethod, setValue, isConnectorTypeEnabled, forgotPasswordMethods]);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_in.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </FormFieldDescription>
        <SignInMethodEditBox signInExperience={signInExperience} />
      </FormField>
      {isDevFeaturesEnabled && hasPasswordMethod && <ForgotPasswordMethodEditBox />}
    </Card>
  );
}

export default SignInForm;
