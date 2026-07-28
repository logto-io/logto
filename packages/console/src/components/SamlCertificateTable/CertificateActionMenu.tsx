import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg?react';
import Download from '@/assets/icons/download.svg?react';
import Deactivate from '@/assets/icons/forbidden.svg?react';
import More from '@/assets/icons/more.svg?react';
import Activate from '@/assets/icons/shield.svg?react';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import { downloadText } from '@/utils/downloader';

import styles from './index.module.scss';
import { type CertificateData } from './types';

type Props = {
  readonly data: CertificateData;
  readonly buildDownloadFilename: (id: string) => string;
  readonly onDelete: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDeactivate: (id: string) => void;
};

function CertificateActionMenu({
  data: { id, certificate, active },
  buildDownloadFilename,
  onDelete,
  onActivate,
  onDeactivate,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onDownload = useCallback(() => {
    downloadText(certificate, buildDownloadFilename(id), 'application/x-x509-ca-cert');
  }, [buildDownloadFilename, certificate, id]);

  return (
    <ActionMenu icon={<More className={styles.icon} />} title={t('general.more_options')}>
      <ActionMenuItem
        iconClassName={styles.icon}
        icon={active ? <Deactivate /> : <Activate />}
        onClick={() => {
          if (active) {
            onDeactivate(id);
          } else {
            onActivate(id);
          }
        }}
      >
        {t(`general.${active ? 'deactivate' : 'activate'}`)}
      </ActionMenuItem>
      <ActionMenuItem
        iconClassName={styles.icon}
        icon={<Download className={styles.icon} />}
        onClick={onDownload}
      >
        {t('general.download')}
      </ActionMenuItem>
      {!active && (
        // Only inactive certificates can be deleted.
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
    </ActionMenu>
  );
}

export default CertificateActionMenu;
