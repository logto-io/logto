import { Theme } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg?react';
import SignInExperienceWelcomeDark from '@/assets/images/sign-in-experience-welcome-dark.svg?react';
import SignInExperienceWelcome from '@/assets/images/sign-in-experience-welcome.svg?react';
import { thirdPartyApp } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly onCreateThirdParty: () => void;
};

function ThirdPartyApplicationEmptyDataPlaceHolder({ onCreateThirdParty }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.applications' });
  const theme = useTheme();
  const { getDocumentationUrl } = useDocumentationUrl();

  const PlaceholderImage =
    theme === Theme.Light ? SignInExperienceWelcome : SignInExperienceWelcomeDark;

  return (
    <div className={styles.placeholder}>
      <PlaceholderImage className={styles.image} />
      <div className={styles.title}>{t('type.third_party.title')}</div>
      <div className={styles.text}>
        <Trans
          components={{
            a: <TextLink href={getDocumentationUrl(thirdPartyApp)} targetBlank="noopener" />,
          }}
        >
          {t('third_party_application_placeholder_description')}
        </Trans>
      </div>
      <Button
        className={styles.button}
        type="primary"
        size="large"
        icon={<Plus />}
        title="applications.create_third_party"
        onClick={onCreateThirdParty}
      />
    </div>
  );
}

export default ThirdPartyApplicationEmptyDataPlaceHolder;
