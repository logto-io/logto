import { MfaFactor } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import WebAuthnIcon from '@ac/assets/icons/factor-webauthn.svg?react';
import { passkeyAddRoute, passkeyManageRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  getPasskeyFieldControl,
  hasVisiblePasskeySection,
  isEditableField,
} from '@ac/utils/security-page';

import { useMfaVerifications } from '../MfaVerificationsProvider';
import SecurityRow, { type SecurityRowData } from '../components/SecurityRow';
import SecuritySection from '../components/SecuritySection';
import { SecurityRowSkeleton, SecuritySkeleton } from '../components/SecuritySkeleton';

const PasskeySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings } = useContext(PageContext);
  const { mfaVerifications, isLoading, hasLoaded } = useMfaVerifications();

  const passkeyControl = getPasskeyFieldControl(
    accountCenterSettings?.fields.passkey,
    accountCenterSettings?.fields.mfa
  );
  const isEditable = isEditableField(passkeyControl);
  const isSectionVisible = hasVisiblePasskeySection(passkeyControl, experienceSettings);
  const isSectionLoading = isSectionVisible && (!hasLoaded || isLoading);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  if (!isSectionVisible) {
    return null;
  }

  const passkeyCount =
    mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn).length ??
    0;
  const isConfigured = passkeyCount > 0;

  const passkeyRow: SecurityRowData = {
    key: 'passkey',
    icon: WebAuthnIcon,
    label: t('account_center.security.passkeys'),
    value: isConfigured
      ? t('account_center.security.passkeys_count', { count: passkeyCount })
      : undefined,
    isConfigured,
    action: isEditable
      ? {
          label: isConfigured
            ? t('account_center.security.manage')
            : t('account_center.security.add'),
          handler: () => {
            navigateTo(isConfigured ? passkeyManageRoute : passkeyAddRoute);
          },
        }
      : undefined,
  };

  return (
    <SecuritySection title={t('account_center.security.passkeys')}>
      {isSectionLoading ? (
        <SecuritySkeleton ariaLabel={t('account_center.security.passkeys')}>
          <SecurityRowSkeleton hasAction={isEditable} />
        </SecuritySkeleton>
      ) : (
        <SecurityRow row={passkeyRow} />
      )}
    </SecuritySection>
  );
};

export default PasskeySection;
