import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg?react';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { captcha, security } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import pageLayout from '@/scss/page-layout.module.scss';

import CaptchaCard from './CaptchaCard';
import CreateCaptchaForm from './CreateCaptchaForm';
import styles from './index.module.scss';
import useDataFetch from './use-data-fetch';

function Security() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isCreateCaptchaFormOpen, setIsCreateCaptchaFormOpen] = useState(false);
  const { data, isLoading } = useDataFetch();

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
      {isLoading ? (
        <FormCardSkeleton formFieldCount={2} />
      ) : (
        <FormCard
          title="security.bot_protection.title"
          description="security.bot_protection.description"
          learnMoreLink={{ href: captcha }}
        >
          <FormField title="security.bot_protection.captcha.title">
            <div className={styles.description}>
              {t('security.bot_protection.captcha.placeholder')}
            </div>
            {data ? (
              <CaptchaCard captchaProvider={data} />
            ) : (
              <Button
                title="security.bot_protection.captcha.add"
                icon={<Plus />}
                onClick={() => {
                  setIsCreateCaptchaFormOpen(true);
                }}
              />
            )}
          </FormField>
        </FormCard>
      )}
      <CreateCaptchaForm
        isOpen={isCreateCaptchaFormOpen}
        onClose={() => {
          setIsCreateCaptchaFormOpen(false);
        }}
      />
    </div>
  );
}

export default Security;
