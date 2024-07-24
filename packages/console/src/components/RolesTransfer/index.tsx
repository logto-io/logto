import { type RoleResponse, RoleType } from '@logto/schemas';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import ManagementApiAccessFlag from '@/assets/icons/management-api-access.svg?react';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import useUserPreferences from '@/hooks/use-user-preferences';
import transferLayout from '@/scss/transfer.module.scss';

import SourceRolesBox from './SourceRolesBox';
import TargetRolesBox from './TargetRolesBox';
import styles from './index.module.scss';

type Props = {
  readonly entityId: string;
  readonly type: RoleType;
  readonly value: RoleResponse[];
  readonly onChange: (value: RoleResponse[]) => void;
};

function RolesTransfer({ entityId, type, value, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isM2mRole = type === RoleType.MachineToMachine;
  const {
    data: { roleWithManagementApiAccessNotificationAcknowledged },
    update,
    isLoaded,
  } = useUserPreferences();

  // Default to true if configs is not loaded to avoid page flickering
  const notificationAcknowledged = isLoaded
    ? Boolean(roleWithManagementApiAccessNotificationAcknowledged)
    : true;

  return (
    <div>
      {isM2mRole && !notificationAcknowledged && (
        <InlineNotification
          action="general.got_it"
          onClick={() => {
            void update({
              roleWithManagementApiAccessNotificationAcknowledged: true,
            });
          }}
        >
          <Trans
            components={{
              flag: <ManagementApiAccessFlag className={styles.flagIcon} />,
            }}
          >
            {t('roles.management_api_access_notification')}
          </Trans>
        </InlineNotification>
      )}
      <FormField title="roles.assign_roles">
        <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
          <SourceRolesBox
            entityId={entityId}
            type={type}
            selectedRoles={value}
            onChange={onChange}
          />
          <div className={transferLayout.verticalBar} />
          <TargetRolesBox selectedRoles={value} onChange={onChange} />
        </div>
      </FormField>
    </div>
  );
}

export default RolesTransfer;
