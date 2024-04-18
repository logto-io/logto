import { type Application, RoleType, type User, ApplicationType } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import EntitiesTransfer from '@/components/EntitiesTransfer';
import { ApplicationItem, UserItem } from '@/components/EntitiesTransfer/components/EntityItem';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

const isUserEntity = (entity: User | Application): entity is User =>
  'customData' in entity || 'identities' in entity;

type Props = {
  readonly roleId: string;
  readonly roleType: RoleType;
  readonly isRemindSkip?: boolean;
  readonly onClose: (success?: boolean) => void;
};

function AssignRoleModal<T extends Application | User>({
  roleId,
  roleType,
  isRemindSkip = false,
  onClose,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<T[]>([]);
  const phraseKey = roleType === RoleType.User ? 'users' : 'applications';

  const api = useApi();

  const handleAssign = async () => {
    if (isLoading || entities.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post(`api/roles/${roleId}/${phraseKey}`, {
        json: { [phraseKey.slice(0, -1) + 'Ids']: entities.map(({ id }) => id) },
      });
      toast.success(t(`role_details.${phraseKey}.assigned_toast_text`));
      onClose(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title={`role_details.${phraseKey}.assign_title`}
        subtitle={`role_details.${phraseKey}.assign_subtitle`}
        size="large"
        footer={
          <>
            <Button
              isLoading={isLoading}
              htmlType="submit"
              title={isRemindSkip ? 'general.skip_for_now' : 'general.cancel'}
              size="large"
              type="default"
              onClick={() => {
                onClose();
              }}
            />
            <Button
              isLoading={isLoading}
              disabled={entities.length === 0}
              htmlType="submit"
              title={`role_details.${phraseKey}.confirm_assign`}
              size="large"
              type="primary"
              onClick={handleAssign}
            />
          </>
        }
        onClose={onClose}
      >
        <FormField title={`role_details.${phraseKey}.assign_field`}>
          <EntitiesTransfer
            searchProps={{
              pathname: `api/${phraseKey}`,
              parameters: {
                excludeRoleId: roleId,
                ...(roleType === RoleType.User ? {} : { types: ApplicationType.MachineToMachine }),
              },
            }}
            selectedEntities={entities}
            emptyPlaceholder={`role_details.${phraseKey}.empty`}
            renderEntity={(entity) =>
              isUserEntity(entity) ? (
                <UserItem entity={entity} />
              ) : (
                <ApplicationItem entity={entity} />
              )
            }
            onChange={setEntities}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default AssignRoleModal;
