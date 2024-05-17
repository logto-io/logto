import { ConnectorType } from '@logto/schemas';
import type { ConnectorResponse } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import UnnamedTrans from '@/components/UnnamedTrans';
import ConfirmModal from '@/ds-components/ConfirmModal';

type Props = {
  readonly data: ConnectorResponse;
  readonly isOpen: boolean;
  readonly isInUse: boolean;
  readonly isLoading: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

function DeleteConnectorConfirmModal({
  data,
  isOpen,
  isInUse,
  isLoading,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isSocial = data.type === ConnectorType.Social;

  return (
    <ConfirmModal
      isOpen={isOpen}
      confirmButtonText="general.delete"
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {!isInUse && t('connector_details.deletion_description')}
      {isInUse && isSocial && (
        <Trans
          t={t}
          i18nKey="connector_details.in_used_social_deletion_description"
          components={{ name: <UnnamedTrans resource={data.name} /> }}
        />
      )}
      {isInUse &&
        !isSocial &&
        t('connector_details.in_used_passwordless_deletion_description', {
          name: t(
            data.type === ConnectorType.Email
              ? 'connector_details.type_email'
              : 'connector_details.type_sms'
          ),
        })}
    </ConfirmModal>
  );
}

export default DeleteConnectorConfirmModal;
