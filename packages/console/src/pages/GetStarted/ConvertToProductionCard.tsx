import { Theme } from '@logto/schemas';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ConvertTenantHeaderDarkIcon from '@/assets/icons/convert-tenant-header-dark.svg?react';
import ConvertTenantHeaderIcon from '@/assets/icons/convert-tenant-header.svg?react';
import ConvertToProductionModal from '@/components/ConvertToProductionModal';
import { contactEmailLink } from '@/consts';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import Spacer from '@/ds-components/Spacer';
import TextLink from '@/ds-components/TextLink';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

const icons = {
  [Theme.Light]: ConvertTenantHeaderIcon,
  [Theme.Dark]: ConvertTenantHeaderDarkIcon,
};

function ConvertToProductionCard() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.get_started' });
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const theme = useTheme();
  const ConvertTenantIcon = icons[theme];

  return (
    <Card className={styles.card}>
      <div className={styles.title}>{t('convert_to_production.card_title')}</div>
      <div className={styles.borderBox}>
        <div className={styles.rowWrapper}>
          <div className={styles.icon}>
            <ConvertTenantIcon />
          </div>
          <div className={styles.columnWrapper}>
            <div className={styles.title}>{t('convert_to_production.title')}</div>
            <div className={styles.subtitle}>
              <Trans
                components={{
                  a: <TextLink href={contactEmailLink} targetBlank="noopener" />,
                }}
              >
                {t('convert_to_production.subtitle')}
              </Trans>
            </div>
          </div>
        </div>
        <Spacer />
        <Button
          title="get_started.convert_to_production.convert_button"
          type="outline"
          onClick={() => {
            setIsConvertModalOpen(true);
          }}
        />
      </div>
      <ConvertToProductionModal
        isOpen={isConvertModalOpen}
        onClose={() => {
          setIsConvertModalOpen(false);
        }}
      />
    </Card>
  );
}

export default ConvertToProductionCard;
