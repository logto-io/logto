import { AppearanceMode } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WelcomeImageDark from '@/assets/images/sign-in-experience-welcome-dark.svg';
import WelcomeImage from '@/assets/images/sign-in-experience-welcome.svg';
import Button from '@/components/Button';
import { useTheme } from '@/hooks/use-theme';

import GuideModal from './GuideModal';
import * as styles from './index.module.scss';

type Props = {
  mutate: () => void;
};

const Welcome = ({ mutate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {theme === AppearanceMode.LightMode ? (
          <WelcomeImage className={styles.icon} />
        ) : (
          <WelcomeImageDark className={styles.icon} />
        )}
        <div className={styles.contentRight}>
          <div className={styles.title}>{t('sign_in_exp.welcome.title')}</div>
          <div className={styles.description}>{t('sign_in_exp.welcome.description')}</div>
          <Button
            title="sign_in_exp.welcome.get_started"
            type="primary"
            onClick={() => {
              setIsOpen(true);
            }}
          />
        </div>
      </div>
      <GuideModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          mutate();
        }}
      />
    </div>
  );
};

export default Welcome;
