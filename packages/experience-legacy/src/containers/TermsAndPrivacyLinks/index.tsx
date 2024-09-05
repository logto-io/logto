import { AgreeToTermsPolicy } from '@logto/schemas';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

import TermsLinks from '@/components/TermsLinks';
import useTerms from '@/hooks/use-terms';

type Props = {
  readonly className?: string;
};

// For sign-in page displaying terms and privacy links use only. No user interaction is needed.
const TermsAndPrivacyLinks = ({ className }: Props) => {
  const { termsOfUseUrl, privacyPolicyUrl, isTermsDisabled, agreeToTermsPolicy } = useTerms();

  if (isTermsDisabled) {
    return null;
  }

  return (
    <div className={className}>
      {
        // Display the automatic agreement message when the policy is set to `Automatic`
        agreeToTermsPolicy === AgreeToTermsPolicy.Automatic ? (
          <Trans
            components={{
              link: (
                <TermsLinks
                  inline
                  termsOfUseUrl={termsOfUseUrl}
                  privacyPolicyUrl={privacyPolicyUrl}
                />
              ),
            }}
          >
            {t('description.auto_agreement')}
          </Trans>
        ) : (
          <TermsLinks termsOfUseUrl={termsOfUseUrl} privacyPolicyUrl={privacyPolicyUrl} />
        )
      }
    </div>
  );
};

export default TermsAndPrivacyLinks;
