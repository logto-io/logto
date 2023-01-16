import type { EmailVerificationCodePayload, PhoneVerificationCodePayload } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { addProfileWithVerificationCodeIdentifier } from '@/apis/interaction';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useRequiredProfileErrorHandler from '@/hooks/use-required-profile-error-handler';
import useLinkSocial from '@/hooks/use-social-link-account';
import type { VerificationCodeIdentifier } from '@/types';
import { SearchParameters } from '@/types';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

import useGeneralVerificationCodeErrorHandler from './use-general-verification-code-error-handler';
import useIdentifierErrorAlert, { IdentifierErrorType } from './use-identifier-error-alert';

const useContinueFlowCodeVerification = (
  _method: VerificationCodeIdentifier,
  target: string,
  errorCallback?: () => void
) => {
  const { t } = useTranslation();
  const { generalVerificationCodeErrorHandlers, errorMessage, clearErrorMessage } =
    useGeneralVerificationCodeErrorHandler();
  const [searchParameters] = useSearchParams();
  const { show } = useConfirmModal();
  const navigate = useNavigate();

  const linkWithSocial = useLinkSocial();

  const requiredProfileErrorHandler = useRequiredProfileErrorHandler({ replace: true });

  const showIdentifierErrorAlert = useIdentifierErrorAlert();

  const identifierExistErrorHandler = useCallback(
    async (method: VerificationCodeIdentifier, target: string) => {
      const linkSocial = searchParameters.get(SearchParameters.linkSocial);

      // Should bind with social confirm modal
      if (linkSocial) {
        const [confirm] = await show({
          confirmText: 'action.bind_and_continue',
          cancelText: 'action.change',
          cancelTextI18nProps: {
            method: t(
              `description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`
            ),
          },
          ModalContent: t('description.link_account_id_exists', {
            type: t(`description.${method === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
            value:
              method === SignInIdentifier.Email
                ? target
                : formatPhoneNumberWithCountryCallingCode(target),
          }),
        });

        if (!confirm) {
          navigate(-1);

          return;
        }

        await linkWithSocial(linkSocial);

        return;
      }

      await showIdentifierErrorAlert(IdentifierErrorType.IdentifierAlreadyExists, method, target);
    },
    [linkWithSocial, navigate, searchParameters, show, showIdentifierErrorAlert, t]
  );

  const verifyVerificationCodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_already_in_use': () => {
        void identifierExistErrorHandler(SignInIdentifier.Phone, target);
      },
      'user.email_already_in_use': () => {
        void identifierExistErrorHandler(SignInIdentifier.Email, target);
      },
      ...requiredProfileErrorHandler,
      ...generalVerificationCodeErrorHandlers,
      callback: errorCallback,
    }),
    [
      errorCallback,
      target,
      identifierExistErrorHandler,
      requiredProfileErrorHandler,
      generalVerificationCodeErrorHandlers,
    ]
  );

  const { run: verifyVerificationCode } = useApi(
    addProfileWithVerificationCodeIdentifier,
    verifyVerificationCodeErrorHandlers
  );

  const onSubmit = useCallback(
    async (payload: EmailVerificationCodePayload | PhoneVerificationCodePayload) => {
      const result = await verifyVerificationCode(payload);

      if (result?.redirectTo) {
        window.location.replace(result.redirectTo);
      }
    },
    [verifyVerificationCode]
  );

  return {
    errorMessage,
    clearErrorMessage,
    onSubmit,
  };
};

export default useContinueFlowCodeVerification;
