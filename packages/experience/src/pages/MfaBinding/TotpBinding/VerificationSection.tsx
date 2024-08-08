import { useTranslation } from 'react-i18next';

import SectionLayout from '@/Layout/SectionLayout';
import TotpCodeVerification from '@/containers/TotpCodeVerification';
import { UserMfaFlow } from '@/types';

type Props = {
  readonly verificationId: string;
};

const VerificationSection = ({ verificationId }: Props) => {
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
      <TotpCodeVerification flow={UserMfaFlow.MfaBinding} verificationId={verificationId} />
    </SectionLayout>
  );
};

export default VerificationSection;
