import { DomainStatus, type CustomDomain } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg';
import More from '@/assets/icons/more.svg';
import DomainStatusTag from '@/components/DomainStatusTag';
import OpenExternalLink from '@/components/OpenExternalLink';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import Spacer from '@/ds-components/Spacer';
import { useConfirmModal } from '@/hooks/use-confirm-modal';

import * as styles from './index.module.scss';

type Props = {
  readonly customDomain: CustomDomain;
  readonly hasExtraTipsOnDelete?: boolean;
  readonly hasOpenExternalLink?: boolean;
  readonly isReadonly?: boolean;
  readonly onDeleteCustomDomain: () => Promise<void>;
};

function CustomDomainHeader({
  customDomain: { domain, status },
  hasExtraTipsOnDelete,
  hasOpenExternalLink,
  isReadonly,
  onDeleteCustomDomain,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { show } = useConfirmModal();

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
            {hasExtraTipsOnDelete && (
              <div className={styles.inUsedDeletionTip}>
                <Trans components={{ span: <span className={styles.strong} /> }}>
                  {t('domain.custom.deletion.in_used_tip', { domain })}
                </Trans>
              </div>
            )}
          </>
        );
      },

      confirmButtonText: 'general.delete',
      title: 'domain.custom.deletion.delete_domain',
    });

    if (!result) {
      return;
    }

    await onDeleteCustomDomain();
    toast.success(t('domain.custom.deletion.deleted'));
  };

  return (
    <div className={styles.header}>
      <div className={styles.domain}>{domain}</div>
      <DomainStatusTag status={status} />
      <Spacer />
      <CopyToClipboard value={domain} variant="icon" />
      {hasOpenExternalLink && <OpenExternalLink link={`https://${domain}`} />}
      {!isReadonly && (
        <ActionMenu
          icon={<More className={styles.icon} />}
          iconSize="small"
          title={<DynamicT forKey="general.more_options" />}
        >
          <ActionMenuItem icon={<Delete />} type="danger" onClick={handleDelete}>
            <DynamicT forKey="general.delete" />
          </ActionMenuItem>
        </ActionMenu>
      )}
    </div>
  );
}

export default CustomDomainHeader;
