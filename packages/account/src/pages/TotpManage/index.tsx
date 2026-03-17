import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import { AccountCenterControlValue, MfaFactor } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications, deleteMfaVerification } from '@ac/apis/mfa';
import ConfirmModal from '@ac/components/ConfirmModal';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

const TotpManage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications, { silent: true });
  const deleteTotpRequest = useApi(deleteMfaVerification);
  const handleError = useErrorHandler();

  const [totpId, setTotpId] = useState<string>();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [hasTotp, setHasTotp] = useState<boolean>();

  useEffect(() => {
    const checkExistingTotp = async () => {
      const [error, result] = await getMfaRequest();

      if (error) {
        setHasTotp(false);
        return;
      }

      const existingTotp = result?.find((mfa) => mfa.type === MfaFactor.TOTP);
      setHasTotp(Boolean(existingTotp));
      setTotpId(existingTotp?.id);
    };

    void checkExistingTotp();
  }, [getMfaRequest]);

  const handleRemove = useCallback(async () => {
    if (!verificationId || !totpId) {
      return;
    }

    const [error] = await deleteTotpRequest(verificationId, totpId);

    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
      });
      setShowRemoveConfirm(false);
      return;
    }

    setToast(t('account_center.mfa.totp_removed'));
    navigate('/', { replace: true });
  }, [
    deleteTotpRequest,
    handleError,
    navigate,
    setToast,
    setVerificationId,
    t,
    totpId,
    verificationId,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  if (hasTotp === undefined) {
    return null;
  }

  if (!hasTotp) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  return (
    <>
      <SecondaryPageLayout
        title="account_center.mfa.totp_manage_title"
        description="account_center.mfa.totp_manage_description"
      >
        <Button
          title="account_center.mfa.totp_remove"
          type="danger"
          onClick={() => {
            setShowRemoveConfirm(true);
          }}
        />
      </SecondaryPageLayout>
      <ConfirmModal
        isOpen={showRemoveConfirm}
        title="account_center.mfa.totp_manage_title"
        confirmText="action.remove"
        confirmButtonType="danger"
        onConfirm={() => {
          void handleRemove();
        }}
        onCancel={() => {
          setShowRemoveConfirm(false);
        }}
      >
        <DynamicT forKey="account_center.mfa.totp_remove_confirm_description" />
      </ConfirmModal>
    </>
  );
};

export default TotpManage;
