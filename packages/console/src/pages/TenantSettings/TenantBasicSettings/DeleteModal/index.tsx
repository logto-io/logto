import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';

import { type TenantResponse } from '@/cloud/types/router';
import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import { tenantAbbreviatedTagNameMap } from '@/components/TenantEnvTag';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly isLoading: boolean;
  readonly onClose: () => void;
  readonly onDelete: () => void;
  readonly tenant: Pick<TenantResponse, 'name' | 'tag'>;
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
              tag: t(tenantAbbreviatedTagNameMap[tag], {}), // Referred to the use in DynamicT component.
            })}
          </Trans>
        </p>
        <p>
          <Trans
            components={{
              span: <span className={styles.highlight} />,
              a: <ContactUsPhraseLink />,
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
