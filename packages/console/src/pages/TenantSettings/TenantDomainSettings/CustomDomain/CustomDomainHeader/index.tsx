import { type AdminConsoleKey } from '@logto/phrases';
import { DomainStatus, type Domain } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import CopyToClipboard from '@/components/CopyToClipboard';
import DynamicT from '@/components/DynamicT';
import Tag from '@/components/Tag';
import type { Props as TagProps } from '@/components/Tag';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import * as styles from './index.module.scss';

type Props = {
  customDomain: Domain;
  onDeleteCustomDomain: () => void;
};

const domainStatusToTag: Record<
  DomainStatus,
  { title: AdminConsoleKey; status: TagProps['status'] }
> = {
  [DomainStatus.PendingVerification]: { title: 'domain.status.connecting', status: 'alert' },
  [DomainStatus.PendingSsl]: { title: 'domain.status.connecting', status: 'alert' },
  [DomainStatus.Active]: { title: 'domain.status.in_used', status: 'success' },
  [DomainStatus.Error]: { title: 'domain.status.failed_to_connect', status: 'error' },
};

function CustomDomainHeader({ customDomain: { id, domain, status }, onDeleteCustomDomain }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tag = domainStatusToTag[status];
  const { show } = useConfirmModal();
  const api = useApi();

  const handleDelete = async () => {
    const [result] = await show({
      ModalContent: () => {
        if (status !== DomainStatus.Active) {
          return <DynamicT forKey="domain.custom.deletion.description" />;
        }

        return (
          <>
            <Trans components={{ span: <span className={styles.strong} /> }}>
              {t('domain.custom.deletion.in_used_description', { domain })}
            </Trans>
            <div className={styles.inUsedDeletionTip}>
              <Trans components={{ span: <span className={styles.strong} /> }}>
                {t('domain.custom.deletion.in_used_tip', { domain })}
              </Trans>
            </div>
          </>
        );
      },

      confirmButtonText: 'general.delete',
      title: 'domain.custom.deletion.delete_domain',
    });

    if (!result) {
      return;
    }

    await api.delete(`api/domains/${id}`);
    toast.success(t('domain.custom.deletion.deleted'));
    onDeleteCustomDomain();
  };

  return (
    <div className={styles.header}>
      <div className={styles.domainInfo}>
        <CopyToClipboard className={styles.domain} value={domain} variant="text" />
        <Tag status={tag.status} type="state" variant="plain">
          <DynamicT forKey={tag.title} />
        </Tag>
      </div>
      <ActionMenu
        buttonProps={{ icon: <More className={styles.icon} />, size: 'large' }}
        title={<DynamicT forKey="general.more_options" />}
      >
        <ActionMenuItem icon={<Delete />} type="danger" onClick={handleDelete}>
          <DynamicT forKey="general.delete" />
        </ActionMenuItem>
      </ActionMenu>
    </div>
  );
}

export default CustomDomainHeader;
