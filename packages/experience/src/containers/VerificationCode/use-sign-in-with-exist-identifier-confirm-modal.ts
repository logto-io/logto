import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { signInWithVerifiedIdentifier } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useSubmitInteractionErrorHandler from '@/hooks/use-submit-interaction-error-handler';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

type CallbackProps = {
  /**
   * Email or phone number identifier.
   * The value will be used to display the detailed identifier info in the confirm modal.
   **/
  identifier: VerificationCodeIdentifier;
  /**
   * The verification ID for the given identifier.
   */
  verificationId: string;
  onCanceled?: () => void;
};

/**
 * For sign-up flow user identifier already exists error handling use.
 *
 * Returns a callback function that shows a confirm modal to allow the user to sign-in with the verified identifier directly.
 */
const useSignInWithExistIdentifierConfirmModal = () => {
  const { t } = useTranslation();

  const { show } = useConfirmModal();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();

  const signInWithIdentifierAsync = useApi(signInWithVerifiedIdentifier);

  const submitInteractionErrorHandler = useSubmitInteractionErrorHandler(
    InteractionEvent.Register,
    {
      replace: true,
    }
  );

  return useCallback(
    ({ identifier: { type, value }, verificationId, onCanceled }: CallbackProps) => {
      show({
        confirmText: 'action.sign_in',
        ModalContent: t('description.create_account_id_exists', {
          type: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
          value:
            type === SignInIdentifier.Phone
              ? formatPhoneNumberWithCountryCallingCode(value)
              : value,
        }),
        onConfirm: async () => {
          const [error, result] = await signInWithIdentifierAsync(verificationId);

          if (error) {
            await handleError(error, submitInteractionErrorHandler);

            return;
          }

          if (result?.redirectTo) {
            await redirectTo(result.redirectTo);
          }
        },
        onCancel: onCanceled,
      });
    },
    [handleError, redirectTo, show, signInWithIdentifierAsync, submitInteractionErrorHandler, t]
  );
};

export default useSignInWithExistIdentifierConfirmModal;
