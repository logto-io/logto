import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';

import { type TenantResponse as TenantInfo } from '@/cloud/types/router';
import { contactEmailLink } from '@/consts';
import { tenantTagMap } from '@/containers/AppContent/components/Topbar/TenantSelector/TenantEnvTag';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDelete: () => void;
  tenant: Pick<TenantInfo, 'name' | 'tag'>;
};

function DeleteModal({ isOpen, isLoading, onClose, onDelete, tenant }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, tag } = tenant;

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      expectedInput={name}
      inputPlaceholder={name}
      className={styles.deleteConfirmModal}
      title="tenants.delete_modal.title"
      confirmButtonText="tenants.delete_modal.delete_button"
      onCancel={onClose}
      onConfirm={onDelete}
    >
      <div className={classNames(styles.description, styles.content)}>
        <p>
          <Trans components={{ span: <span className={styles.bold} /> }}>
            {t('tenants.delete_modal.description_line1', {
              name,
              tag: t(tenantTagMap[tag], {}), // Referred to the use in DynamicT component.
            })}
          </Trans>
        </p>
        <p>
          <Trans
            components={{
              span: <span className={styles.highlight} />,
              a: <TextLink href={contactEmailLink} target="_blank" />,
            }}
          >
            {t('tenants.delete_modal.description_line2')}
          </Trans>
        </p>
        <p>
          <Trans components={{ span: <span className={styles.bold} /> }}>
            {t('tenants.delete_modal.description_line3', { name })}
          </Trans>
        </p>
      </div>
    </DeleteConfirmModal>
  );
}

export default DeleteModal;
