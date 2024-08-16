import { AgreeToTermsPolicy, experience } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import FocusedAuthPageLayout from '@/Layout/FocusedAuthPageLayout';
import SingleSignOnForm from '@/components/SingleSignOnForm';
import useTerms from '@/hooks/use-terms';

const SingleSignOnLanding = () => {
  const { t } = useTranslation();
  const { agreeToTermsPolicy } = useTerms();

  return (
    <FocusedAuthPageLayout
      pageMeta={{ titleKey: 'action.single_sign_on' }}
      title="action.single_sign_on"
      description={t('description.single_sign_on_email_form')}
      footerTermsDisplayPolicies={[AgreeToTermsPolicy.Automatic]}
      authOptionsLink={{
        to: `/${experience.routes.signIn}`,
        text: 'description.all_sign_in_options',
      }}
    >
      <SingleSignOnForm
        /* Should display terms and privacy checkbox when we need to confirm the terms and privacy policy for both sign-in and sign-up */
        isTermsAndPrivacyCheckboxVisible={agreeToTermsPolicy === AgreeToTermsPolicy.Manual}
      />
    </FocusedAuthPageLayout>
  );
};

export default SingleSignOnLanding;
