import { AccountCenterControlValue, ConnectorType } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Select, { type Option } from '@/ds-components/Select';
import TextLink from '@/ds-components/TextLink';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';

import type { AccountCenterFieldKey } from '../../types';
import ConnectorSetupWarning from '../SignUpAndSignIn/components/ConnectorSetupWarning';

import type { AccountCenterFieldItem } from './constants';
import styles from './index.module.scss';

type Props = {
  readonly item: AccountCenterFieldItem;
  readonly value: AccountCenterControlValue;
  readonly isReadOnly: boolean;
  readonly isMfaEnabled: boolean;
  readonly onChange: (field: AccountCenterFieldKey, value?: AccountCenterControlValue) => void;
  readonly fieldOptions: Array<Option<AccountCenterControlValue>>;
};

const getConnectorTypeForField = (fieldKey: AccountCenterFieldKey): ConnectorType | undefined => {
  if (fieldKey === 'email') {
    return ConnectorType.Email;
  }
  if (fieldKey === 'phone') {
    return ConnectorType.Sms;
  }
  if (fieldKey === 'social') {
    return ConnectorType.Social;
  }
  return undefined;
};

function AccountCenterField({
  item,
  value,
  isReadOnly,
  isMfaEnabled,
  onChange,
  fieldOptions,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isConnectorTypeEnabled } = useEnabledConnectorTypes();

  const connectorType = getConnectorTypeForField(item.key);
  const shouldShowConnectorWarning =
    connectorType &&
    value !== AccountCenterControlValue.Off &&
    !isConnectorTypeEnabled(connectorType);

  const shouldShowMfaWarning =
    item.key === 'mfa' && value !== AccountCenterControlValue.Off && !isMfaEnabled;

  return (
    <div>
      <div className={styles.fieldRow} data-disabled={isReadOnly || undefined}>
        <div className={styles.fieldLabel}>
          <div className={styles.fieldName}>
            <DynamicT forKey={item.title} />
          </div>
        </div>
        <div className={styles.fieldControl}>
          <Select<AccountCenterControlValue>
            isDropdownFullWidth
            value={value}
            options={fieldOptions}
            isReadOnly={isReadOnly}
            onChange={(value) => {
              onChange(item.key, value);
            }}
          />
        </div>
      </div>
      {shouldShowConnectorWarning && <ConnectorSetupWarning requiredConnectors={[connectorType]} />}
      {shouldShowMfaWarning && (
        <InlineNotification className={styles.notice}>
          <Trans
            components={{
              a: <TextLink to="/mfa" />,
            }}
          >
            {t('sign_in_exp.setup_warning.no_mfa_factor', {
              link: t('sign_in_exp.setup_warning.setup_link'),
            })}
          </Trans>
        </InlineNotification>
      )}
    </div>
  );
}

export default AccountCenterField;
