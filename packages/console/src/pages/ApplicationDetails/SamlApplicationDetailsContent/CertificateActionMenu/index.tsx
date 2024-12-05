import { type SamlApplicationSecretResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Download from '@/assets/icons/download.svg?react';
import More from '@/assets/icons/more.svg?react';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import { downloadText } from '@/utils/downloader';

import { buildSamlSigningCertificateFilename } from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly appId: string;
  readonly secret: SamlApplicationSecretResponse;
};

function CertificateActionMenu({ secret: { id, certificate }, appId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onDownload = useCallback(() => {
    downloadText(
      certificate,
      buildSamlSigningCertificateFilename(appId, id),
      'application/x-x509-ca-cert'
    );
  }, [appId, certificate, id]);

  return (
    <ActionMenu icon={<More className={styles.icon} />} title={t('general.more_options')}>
      <ActionMenuItem iconClassName={styles.icon} icon={<Download />} onClick={onDownload}>
        {t('general.download')}
      </ActionMenuItem>
    </ActionMenu>
  );
}

export default CertificateActionMenu;
