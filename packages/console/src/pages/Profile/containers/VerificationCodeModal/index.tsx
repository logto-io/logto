import type { RequestErrorBody } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { HTTPError } from 'ky';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';

import ArrowConnection from '@/assets/images/arrow-connection.svg';
import TextLink from '@/components/TextLink';
import VerificationCodeInput, { defaultLength } from '@/components/VerificationCodeInput';
import { adminTenantEndpoint, meApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import useCurrentUser from '@/hooks/use-current-user';

import MainFlowLikeModal from '../../components/MainFlowLikeModal';
import { checkLocationState } from '../../utils';
import * as styles from './index.module.scss';

export const resendTimeout = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + resendTimeout);

  return now;
};

const VerificationCodeModal = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { state } = useLocation();
  const { reload } = useCurrentUser();
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const api = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
    hideErrorToast: true,
  });
  const { email, action } = checkLocationState(state)
    ? state
    : { email: undefined, action: undefined };

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
      await api.post(`me/verification-codes/verify`, { json: { verificationCode, email } });

      if (action === 'changeEmail') {
        await api.patch(`me/user`, { json: { primaryEmail: email } });
        toast.success(t('profile.email_changed'));

        onClose();
      }

      if (action === 'changePassword') {
        navigate('../change-password', { state });
      }
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const logtoError = await error.response.json<RequestErrorBody>();
        setError(logtoError.message);
      } else {
        setError(String(error));
      }
    }
  }, [code, email, api, action, t, onClose, navigate, state]);

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      void onSubmit();
    }
  }, [code, onSubmit]);

  return (
    <MainFlowLikeModal
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
    </MainFlowLikeModal>
  );
};

export default VerificationCodeModal;
