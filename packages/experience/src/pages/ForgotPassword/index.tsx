import { useTranslation } from 'react-i18next';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import usePrefilledIdentifier from '@/hooks/use-prefilled-identifier';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import { identifierInputDescriptionMap } from '@/utils/form';

import ErrorPage from '../ErrorPage';

import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPassword = () => {
  const { isForgotPasswordEnabled, enabledMethodSet } = useForgotPasswordSettings();
  const { t } = useTranslation();
  const enabledMethods = [...enabledMethodSet];
  const { value: prefilledValue } = usePrefilledIdentifier({
    enabledIdentifiers: enabledMethods,
    isForgotPassword: true,
  });

  if (!isForgotPasswordEnabled) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title="description.reset_password"
      description="description.reset_password_description"
      descriptionProps={{
        types: enabledMethods.map((method) => t(identifierInputDescriptionMap[method])),
      }}
    >
      <ForgotPasswordForm autoFocus defaultValue={prefilledValue} enabledTypes={enabledMethods} />
    </SecondaryPageLayout>
  );
};

export default ForgotPassword;
