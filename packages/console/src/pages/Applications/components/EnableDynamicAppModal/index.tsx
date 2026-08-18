import classNames from 'classnames';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSWRConfig } from 'swr';

import AddOnNoticeFooter from '@/components/AddOnNoticeFooter';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import { cimdConfigEndpoint } from '@/hooks/use-dynamic-app';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import modalStyles from '@/scss/modal.module.scss';
import { dynamicAppId } from '@/types/applications';

import styles from './index.module.scss';

type Props = {
  readonly onClose: () => void;
};

/**
 * Confirmation step for the dynamic app (CIMD) card. There is no application entity to create;
 * confirming turns on the tenant-level feature switch.
 */
function EnableDynamicAppModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { mutate } = useSWRConfig();
  const { navigate } = useTenantPathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await api.patch(cimdConfigEndpoint, { json: { enabled: true } });
      await mutate(cimdConfigEndpoint);
    } finally {
      setIsSubmitting(false);
    }

    toast.success(t('applications.dynamic_app.enabled'));
    onClose();
    navigate(`/applications/${dynamicAppId}`, { replace: true });
  };

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      onRequestClose={onClose}
    >
      <ModalLayout
        title="applications.dynamic_app.enable_confirm_modal.title"
        footer={
          /** The beta pricing notice only concerns Logto Cloud, OSS is never charged for it. */
          isCloud ? (
            <AddOnNoticeFooter
              isLoading={isSubmitting}
              buttonTitle="general.enable"
              onClick={handleConfirm}
            >
              {t('applications.dynamic_app.enable_confirm_modal.beta_pricing_notice')}
            </AddOnNoticeFooter>
          ) : (
            <>
              <Button title="general.cancel" onClick={onClose} />
              <Button
                type="primary"
                title="general.enable"
                isLoading={isSubmitting}
                onClick={handleConfirm}
              />
            </>
          )
        }
        onClose={onClose}
      >
        <div className={styles.content}>
          {t('applications.dynamic_app.enable_confirm_modal.content')}
        </div>
      </ModalLayout>
    </ReactModal>
  );
}

export default EnableDynamicAppModal;
