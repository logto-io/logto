import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WelcomeImage from '@/assets/images/sign-in-experience-welcome.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';

import GuideModal from './GuideModal';
import * as styles from './Welcome.module.scss';

type Props = {
  mutate: () => void;
};

const Welcome = ({ mutate }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className={styles.welcome}>
        <CardTitle title="sign_in_exp.title" subtitle="sign_in_exp.description" />
        <div className={styles.content}>
          <img src={WelcomeImage} />
          <div>{t('sign_in_exp.welcome.title')}</div>
          <Button
            title="admin_console.sign_in_exp.welcome.get_started"
            type="primary"
            onClick={() => {
              setIsOpen(true);
            }}
          />
        </div>
      </Card>
      <GuideModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          mutate();
        }}
      />
    </>
  );
};

export default Welcome;
