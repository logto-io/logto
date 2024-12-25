import { type SamlApplicationSecretResponse } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg?react';
import Download from '@/assets/icons/download.svg?react';
import Deactivate from '@/assets/icons/moon.svg?react';
import More from '@/assets/icons/more.svg?react';
import Activate from '@/assets/icons/sun.svg?react';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import useApi from '@/hooks/use-api';
import { downloadText } from '@/utils/downloader';

import { buildSamlSigningCertificateFilename } from '../utils';

import styles from './index.module.scss';

export type Props = {
  readonly appId: string;
  readonly secret: SamlApplicationSecretResponse;
  readonly onDelete: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDeactivate: (id: string) => void;
};

function CertificateActionMenu({
  secret: { id, certificate, active },
  appId,
  onDelete,
  onActivate,
  onDeactivate,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const onDownload = useCallback(() => {
    downloadText(
      certificate,
      buildSamlSigningCertificateFilename(appId, id),
      'application/x-x509-ca-cert'
    );
  }, [appId, certificate, id]);

  return (
    <ActionMenu icon={<More className={styles.icon} />} title={t('general.more_options')}>
      {!active && (
        <ActionMenuItem
          type="danger"
          icon={<Delete />}
          onClick={() => {
            onDelete(id);
          }}
        >
          {t('general.delete')}
        </ActionMenuItem>
      )}
      {active ? (
        <ActionMenuItem
          iconClassName={styles.icon}
          icon={<Deactivate />}
          onClick={() => {
            onDeactivate(id);
          }}
        >
          {t('general.deactivate')}
        </ActionMenuItem>
      ) : (
        <ActionMenuItem
          iconClassName={styles.icon}
          icon={<Activate />}
          onClick={() => {
            onActivate(id);
          }}
        >
          {t('general.activate')}
        </ActionMenuItem>
      )}
      <ActionMenuItem iconClassName={styles.icon} icon={<Download />} onClick={onDownload}>
        {t('general.download')}
      </ActionMenuItem>
    </ActionMenu>
  );
}

export default CertificateActionMenu;
