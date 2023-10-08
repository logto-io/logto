import { useTranslation } from 'react-i18next';

import SectionLayout from '@/Layout/SectionLayout';
import TotpCodeVerification from '@/containers/TotpCodeVerification';
import { UserMfaFlow } from '@/types';

const VerificationSection = () => {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title="mfa.step"
      titleProps={{
        step: 2,
        content: t('mfa.enter_one_time_code'),
      }}
      description="mfa.enter_one_time_code_link_description"
    >
      <TotpCodeVerification flow={UserMfaFlow.MfaBinding} />
    </SectionLayout>
  );
};

export default VerificationSection;
