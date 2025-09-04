import type { SignInExperience } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';

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
  const { watch } = useFormContext<SignInExperienceForm>();

  const signInMethods = watch('signIn.methods');
  const hasPasswordMethod = signInMethods.some((method) => method.password);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_in.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </FormFieldDescription>
        <SignInMethodEditBox signInExperience={signInExperience} />
      </FormField>
      {hasPasswordMethod && <ForgotPasswordMethodEditBox />}
    </Card>
  );
}

export default SignInForm;
