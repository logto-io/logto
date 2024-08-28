import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';

import ArrowConnection from '@/assets/icons/arrow-connection.svg';
import VerificationCodeInput, { defaultLength } from '@/components/VerificationCodeInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import TextLink from '@/ds-components/TextLink';
import { useStaticApi } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentUser from '@/hooks/use-current-user';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ExperienceLikeModal from '../../components/ExperienceLikeModal';
import { handleError, parseLocationState } from '../../utils';

import * as styles from './index.module.scss';

const resendTimeout = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + resendTimeout);

  return now;
};

function VerificationCodeModal() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const { show: showModal } = useConfirmModal();
  const { state } = useLocation();
  const { reload } = useCurrentUser();
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });
  const { email, action } = parseLocationState(state);

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const onClose = useCallback(() => {
    navigate('/profile');
    void reload();
  }, [navigate, reload]);

  const onSubmit = useCallback(async () => {
    const verificationCode = code.join('');

    if (!email || !verificationCode) {
      return;
    }

    try {
      await api.post(`me/verification-codes/verify`, { json: { verificationCode, email, action } });

      if (action === 'changeEmail') {
        await api.patch('me', { json: { primaryEmail: email } });
        toast.success(t('profile.email_changed'));

        onClose();
      }

      if (action === 'changePassword') {
        navigate('../change-password', { state });
      }
    } catch (error: unknown) {
      void handleError(error, async (code, message) => {
        // The following errors will be displayed as inline error message.
        if (
          [
            'verification_code.code_mismatch',
            'verification_code.exceed_max_try',
            'verification_code.not_found',
          ].includes(code)
        ) {
          setError(message);

          return true;
        }

        // Other verification code errors will be displayed in a popup modal.
        if (code.startsWith('verification_code.') || code === 'user.email_already_in_use') {
          await showModal({
            ModalContent: message,
            type: 'alert',
            cancelButtonText: 'general.got_it',
          });
          onClose();

          return true;
        }
      });
    }
  }, [code, email, api, action, t, onClose, navigate, state, showModal]);

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      void onSubmit();
    }
  }, [code, onSubmit]);

  return (
    <ExperienceLikeModal
      title="profile.code.enter_verification_code"
      subtitle="profile.code.enter_verification_code_subtitle"
      subtitleProps={conditional(email && { target: email })}
      onClose={onClose}
    >
      <VerificationCodeInput
        name="verificationCode"
        value={code}
        error={error}
        onChange={(value) => {
          setCode(value);
          setError(undefined);
        }}
      />
      {isRunning ? (
        <div className={styles.message}>
          {t('profile.code.resend_countdown', { countdown: seconds })}
        </div>
      ) : (
        <TextLink
          className={styles.link}
          onClick={async () => {
            setCode([]);
            setError(undefined);
            await api.post(`me/verification-codes`, { json: { email } });
            restart(getTimeout(), true);
          }}
        >
          {t('profile.code.resend')}
        </TextLink>
      )}
      {action === 'changePassword' && (
        <TextLink
          className={styles.link}
          icon={<ArrowConnection />}
          onClick={() => {
            navigate('../verify-password', { state });
          }}
        >
          {t('profile.password.verify_via_password')}
        </TextLink>
      )}
    </ExperienceLikeModal>
  );
}

export default VerificationCodeModal;
