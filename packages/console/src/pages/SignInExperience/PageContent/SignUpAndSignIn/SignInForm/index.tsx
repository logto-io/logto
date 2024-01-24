import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';

import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

import SignInMethodEditBox from './SignInMethodEditBox';

function SignInForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.sign_in.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </FormFieldDescription>
        <SignInMethodEditBox />
      </FormField>
    </Card>
  );
}

export default SignInForm;
