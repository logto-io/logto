import { useTranslation } from 'react-i18next';

import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  inline?: boolean;
  termsOfUseUrl?: string;
  privacyPolicyUrl?: string;
};

const TermsLinks = ({ className, inline, termsOfUseUrl, privacyPolicyUrl }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      {termsOfUseUrl && (
        <TextLink
          className={styles.link}
          text="description.terms_of_use"
          href={termsOfUseUrl}
          type={inline ? 'inlinePrimary' : 'primary'}
          target="_blank"
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      )}
      {termsOfUseUrl && privacyPolicyUrl && ` ${t('description.and')} `}
      {privacyPolicyUrl && (
        <TextLink
          className={styles.link}
          text="description.privacy_policy"
          href={privacyPolicyUrl}
          type={inline ? 'inlinePrimary' : 'primary'}
          target="_blank"
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      )}
    </>
  );
};

export default TermsLinks;
