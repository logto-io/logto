import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg?react';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { captcha, security } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import pageLayout from '@/scss/page-layout.module.scss';

import styles from './index.module.scss';

function Security() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="security.page_title" />
      <div className={classNames(pageLayout.headline, styles.headline)}>
        <CardTitle
          title="security.title"
          subtitle="security.subtitle"
          learnMoreLink={{ href: security }}
        />
      </div>
      <FormCard
        title="security.bot_protection.title"
        description="security.bot_protection.description"
        learnMoreLink={{ href: captcha }}
      >
        <FormField title="security.bot_protection.captcha.title">
          <div className={styles.description}>
            {t('security.bot_protection.captcha.placeholder')}
          </div>
          <Button
            title="security.bot_protection.captcha.add"
            icon={<Plus />}
            onClick={() => {
              // TODO: Implement captcha
            }}
          />
        </FormField>
      </FormCard>
    </div>
  );
}

export default Security;
