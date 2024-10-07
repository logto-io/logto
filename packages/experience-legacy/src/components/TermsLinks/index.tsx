import { useTranslation } from 'react-i18next';

import TextLink, { type Props as TextLinkProps } from '@/components/TextLink';

import styles from './index.module.scss';

type Props = {
  readonly linkType?: TextLinkProps['type'];
  // eslint-disable-next-line react/boolean-prop-naming
  readonly inline?: boolean;
  readonly termsOfUseUrl?: string;
  readonly privacyPolicyUrl?: string;
};

const TermsLinks = ({ inline, termsOfUseUrl, privacyPolicyUrl, linkType = 'secondary' }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      {termsOfUseUrl && (
        <TextLink
          className={styles.link}
          text="description.terms_of_use"
          href={termsOfUseUrl}
          type={linkType}
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
          type={linkType}
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
