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
          type="inlinePrimary"
          target="_blank"
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      )}
      {termsOfUseUrl && privacyPolicyUrl && inline && ` ${t('description.and')} `}
      {termsOfUseUrl && privacyPolicyUrl && !inline && <i className={styles.divider} />}
      {privacyPolicyUrl && (
        <TextLink
          className={styles.link}
          text="description.privacy_policy"
          href={privacyPolicyUrl}
          type="inlinePrimary"
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
