import { SignInIdentifier } from '@logto/schemas';
import type { VerificationCodeIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useLinkSocial from '@/hooks/use-social-link-account';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

const useLinkSocialConfirmModal = () => {
  const { show } = useConfirmModal();
  const { t } = useTranslation();
  const linkWithSocial = useLinkSocial();
  const navigate = useNavigate();

  return useCallback(
    async (
      identifier: VerificationCodeIdentifier,
      identifierVerificationId: string,
      socialVerificationId: string
    ) => {
      const { type, value } = identifier;

      show({
        confirmText: 'action.bind_and_continue',
        cancelText: 'action.change',
        cancelTextI18nProps: {
          method: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        },
        ModalContent: t('description.link_account_id_exists', {
          type: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
          value:
            type === SignInIdentifier.Phone
              ? formatPhoneNumberWithCountryCallingCode(value)
              : value,
        }),
        onConfirm: async () => {
          await linkWithSocial(identifierVerificationId, socialVerificationId);
        },
        onCancel: () => {
          navigate(-1);
        },
      });
    },
    [linkWithSocial, navigate, show, t]
  );
};

export default useLinkSocialConfirmModal;
