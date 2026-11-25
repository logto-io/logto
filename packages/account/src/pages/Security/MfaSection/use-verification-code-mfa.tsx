import { MfaFactor, type UserMfaVerificationResponse } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { addVerificationCodeMfa, deleteMfaVerification } from '@ac/apis/mfa';
import ConfirmModal from '@ac/components/ConfirmModal';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import { type VerificationCodeMfaFactor } from '@ac/utils/pending-step-up';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

/**
 * Enrolls and removes the email / phone verification code MFA factors, including the removal
 * confirmation and the step-up resume. `onUpdated` reloads the MFA state after a change.
 */
export const useVerificationCodeMfa = (onUpdated: () => Promise<void>) => {
  const { t } = useTranslation();
  const { checkIdentityProof } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
  const handleError = useErrorHandler();
  const addVerificationCodeMfaApi = useApi(addVerificationCodeMfa);
  const deleteMfaVerificationApi = useApi(deleteMfaVerification);
  const [pendingRemoveVerification, setPendingRemoveVerification] =
    useState<UserMfaVerificationResponse[number]>();

  const addVerificationCode = useCallback(
    async (factor: VerificationCodeMfaFactor, isResumed = false) => {
      const [error] = await addVerificationCodeMfaApi(factor);

      if (error) {
        if (
          await requestStepUp(error, { type: 'add-verification-code-mfa', factor }, { isResumed })
        ) {
          return;
        }

        await handleError(error);
        return;
      }

      await onUpdated();
    },
    [addVerificationCodeMfaApi, handleError, onUpdated, requestStepUp]
  );

  const removeVerificationCode = useCallback(
    async (id: string, isResumed = false) => {
      const [error] = await deleteMfaVerificationApi(id);

      if (error) {
        if (
          await requestStepUp(error, { type: 'remove-verification-code-mfa', id }, { isResumed })
        ) {
          return;
        }

        await handleError(error);
        return;
      }

      await onUpdated();
    },
    [deleteMfaVerificationApi, handleError, onUpdated, requestStepUp]
  );

  const onAddVerificationCode = useCallback(
    async (factor: VerificationCodeMfaFactor) => {
      if (await checkIdentityProof()) {
        await addVerificationCode(factor);
        return;
      }

      await startStepUp({ type: 'add-verification-code-mfa', factor });
    },
    [addVerificationCode, checkIdentityProof, startStepUp]
  );

  const confirmRemove = useCallback(async () => {
    if (!pendingRemoveVerification) {
      return;
    }

    const { id } = pendingRemoveVerification;
    setPendingRemoveVerification(undefined);

    if (await checkIdentityProof()) {
      await removeVerificationCode(id);
      return;
    }

    await startStepUp({ type: 'remove-verification-code-mfa', id });
  }, [checkIdentityProof, pendingRemoveVerification, removeVerificationCode, startStepUp]);

  useEffect(() => {
    const action = consumePendingStepUpAction([
      'add-verification-code-mfa',
      'remove-verification-code-mfa',
    ]);

    if (action?.type === 'add-verification-code-mfa') {
      void addVerificationCode(action.factor, true);
    }

    if (action?.type === 'remove-verification-code-mfa') {
      void removeVerificationCode(action.id, true);
    }
  }, [addVerificationCode, removeVerificationCode]);

  const isPhone = pendingRemoveVerification?.type === MfaFactor.PhoneVerificationCode;

  const removeConfirmModal = (
    <ConfirmModal
      isOpen={pendingRemoveVerification !== undefined}
      title={
        isPhone
          ? 'account_center.security.remove_phone_verification_code_confirmation_title'
          : 'account_center.security.remove_email_verification_code_confirmation_title'
      }
      confirmText="account_center.security.remove"
      confirmButtonType="danger"
      cancelText="action.cancel"
      onConfirm={() => {
        void confirmRemove();
      }}
      onCancel={() => {
        setPendingRemoveVerification(undefined);
      }}
    >
      {t(
        isPhone
          ? 'account_center.security.remove_phone_verification_code_confirmation_description'
          : 'account_center.security.remove_email_verification_code_confirmation_description'
      )}
    </ConfirmModal>
  );

  return {
    onAddVerificationCode,
    onRemoveVerificationCode: setPendingRemoveVerification,
    removeConfirmModal,
  };
};
