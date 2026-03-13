import { experience } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import { InputField } from '@/components/InputFields';
import useToast from '@/hooks/use-toast';
import Button from '@/shared/components/Button';

import ErrorPage from '../ErrorPage';

import styles from './index.module.scss';
import {
  hasDeviceCodeValue,
  createDeviceFlowRequestBody,
  normalizeDisplayValue,
  parseDeviceFlowContext,
  readDeviceFlowFailureError,
  readDeviceFlowXsrfCookie,
  submitDeviceFlowRequest,
  toNavigateUrl,
} from './utils';

const deviceSuccessPath = `/${experience.routes.device}/success`;
const requiredDeviceCodeErrorKey = 'error.device_code_required';

const deviceFlowErrorMap = {
  NotFoundError: 'error.invalid_device_code',
  ExpiredError: 'error.invalid_device_code',
  AlreadyUsedError: 'error.invalid_device_code',
  AbortedError: 'error.device_flow_aborted',
} as const;
type DeviceErrorKey =
  | typeof requiredDeviceCodeErrorKey
  | (typeof deviceFlowErrorMap)[keyof typeof deviceFlowErrorMap]
  | 'error.something_went_wrong';

const isDeviceFlowError = (value: string): value is keyof typeof deviceFlowErrorMap =>
  value in deviceFlowErrorMap;

const resolveServerErrorKey = (error: string): DeviceErrorKey => {
  if (error === 'NoCodeError') {
    return requiredDeviceCodeErrorKey;
  }
  return isDeviceFlowError(error) ? deviceFlowErrorMap[error] : 'error.something_went_wrong';
};

const resolveSubmitFailureErrorKey = (
  error?: string
): 'error.invalid_session' | 'error.something_went_wrong' =>
  error === 'invalid_request' ? 'error.invalid_session' : 'error.something_went_wrong';

const Device = () => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  /**
   * Device flow is driven by provider-owned redirects rather than the interaction routes that rely
   * on preserved `app_id` search params. Use the plain router navigate here so provider redirects
   * like `/device?error=InvalidRequest` can round-trip without pathname rewriting.
   */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientErrorKey, setClientErrorKey] = useState<DeviceErrorKey>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfirm = searchParams.has('user_code');
  const error = searchParams.get('error');
  const searchParamString = searchParams.toString();
  const deviceFlowContext = useMemo(
    () => parseDeviceFlowContext(new URLSearchParams(searchParamString)),
    [searchParamString]
  );
  const deviceFlowXsrf = readDeviceFlowXsrfCookie();

  const [userCode, setUserCode] = useState('');

  useEffect(() => {
    setClientErrorKey(undefined);

    const initialValue = isConfirm ? deviceFlowContext.userCode : deviceFlowContext.inputCode;
    setUserCode(normalizeDisplayValue(initialValue ?? ''));
  }, [deviceFlowContext, isConfirm]);

  useEffect(() => {
    if (!isConfirm && error === 'InvalidRequest') {
      setToast(t('error.invalid_session'));
    }
  }, [error, isConfirm, setToast, t]);

  if (!deviceFlowXsrf) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const errorKey: DeviceErrorKey | undefined =
    !isConfirm && error && error !== 'InvalidRequest' ? resolveServerErrorKey(error) : undefined;
  const resolvedErrorKey = clientErrorKey ?? errorKey;
  const translateKey = (key: TFuncKey, options?: Record<string, unknown>): string => {
    const translated = options ? t(key, options) : t(key);
    return typeof translated === 'string' ? translated : t('error.something_went_wrong');
  };
  const errorMessage = resolvedErrorKey ? translateKey(resolvedErrorKey) : undefined;

  /**
   * Core now redirects the device flow back with only the user-visible state in the URL. The
   * page rebuilds the POST body locally and reads the xsrf token from the short-lived cookie,
   * which keeps the SPA flow without exposing the submit token in the address bar.
   */
  const handleFormSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await submitDeviceFlowRequest(
        createDeviceFlowRequestBody({
          userCode,
          xsrf: deviceFlowXsrf,
        })
      );

      if (response.redirected) {
        navigate(toNavigateUrl(response.url), { replace: true });
        return;
      }

      if (response.ok) {
        navigate(deviceSuccessPath, { replace: true });
        return;
      }

      const failureError = await readDeviceFlowFailureError(response);
      setToast(t(resolveSubmitFailureErrorKey(failureError)));
    } catch {
      setToast(t('error.something_went_wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (isSubmitting) {
      return;
    }

    /**
     * Empty input is handled locally so users get the error state immediately instead of waiting
     * for a round-trip that would only come back as the provider's NoCodeError.
     */
    if (!hasDeviceCodeValue(userCode)) {
      setClientErrorKey(requiredDeviceCodeErrorKey);
      return;
    }

    setClientErrorKey(undefined);

    await handleFormSubmit();
  };

  return (
    <LandingPageLayout title="description.device_activation">
      <div className={styles.content}>
        <div className={styles.description}>
          {t(
            errorMessage
              ? 'description.device_activation_error_description'
              : 'description.device_activation_description'
          )}
        </div>
        <form onSubmit={handleContinue}>
          <InputField
            autoFocus
            className={styles.inputField}
            errorMessage={errorMessage}
            isDanger={Boolean(errorMessage)}
            label={t('input.code')}
            name="device_user_code"
            value={userCode}
            onChange={(event) => {
              setClientErrorKey(undefined);
              setUserCode(normalizeDisplayValue(event.currentTarget.value));
            }}
          />
          <Button htmlType="submit" isLoading={isSubmitting} title="action.continue" />
        </form>
      </div>
    </LandingPageLayout>
  );
};

export default Device;
