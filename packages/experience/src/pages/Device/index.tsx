import { experience } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import { InputField } from '@/components/InputFields';
import Button from '@/shared/components/Button';

import ErrorPage from '../ErrorPage';

import styles from './index.module.scss';
import {
  hasDeviceCodeValue,
  createDeviceFlowRequestBody,
  normalizeDisplayValue,
  parseDeviceFlowContext,
  submitDeviceFlowRequest,
  toNavigateUrl,
} from './utils';

const deviceSuccessPath = `/${experience.routes.device}/success`;

const deviceFlowErrorMap = {
  NoCodeError: 'error.invalid_device_code',
  NotFoundError: 'error.invalid_device_code',
  ExpiredError: 'error.invalid_device_code',
  AlreadyUsedError: 'error.invalid_device_code',
  AbortedError: 'error.device_flow_aborted',
} as const;
type DeviceErrorKey =
  | (typeof deviceFlowErrorMap)[keyof typeof deviceFlowErrorMap]
  | 'error.something_went_wrong';

const Device = () => {
  const { t } = useTranslation();
  const { setToast } = useContext(PageContext);
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

  const [userCode, setUserCode] = useState('');

  useEffect(() => {
    if (!deviceFlowContext) {
      return;
    }

    setClientErrorKey(undefined);

    const initialValue = isConfirm ? deviceFlowContext.userCode : deviceFlowContext.inputCode;
    setUserCode(normalizeDisplayValue(initialValue ?? ''));
  }, [deviceFlowContext, isConfirm]);

  if (!deviceFlowContext) {
    return <ErrorPage title="error.something_went_wrong" />;
  }

  const isDeviceFlowError = (value: string): value is keyof typeof deviceFlowErrorMap =>
    value in deviceFlowErrorMap;
  const errorKey: DeviceErrorKey | undefined =
    !isConfirm && error
      ? isDeviceFlowError(error)
        ? deviceFlowErrorMap[error]
        : 'error.something_went_wrong'
      : undefined;
  const resolvedErrorKey = clientErrorKey ?? errorKey;
  const translateKey = (key: TFuncKey): string => {
    const translated = t(key);
    return typeof translated === 'string' ? translated : t('error.something_went_wrong');
  };
  const errorMessage = resolvedErrorKey ? translateKey(resolvedErrorKey) : undefined;

  /**
   * Core now redirects the device flow back with structured query fields instead of raw provider
   * HTML. The page rebuilds the POST body locally, which keeps the SPA flow while removing the
   * need to inject a server-generated form into the DOM.
   */
  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setToast('');

    try {
      const response = await submitDeviceFlowRequest({
        action: deviceFlowContext.action,
        body: createDeviceFlowRequestBody({
          userCode,
          xsrf: deviceFlowContext.xsrf,
        }),
      });

      if (response.redirected) {
        navigate(toNavigateUrl(response.url), { replace: true });
        return;
      }

      if (response.ok) {
        navigate(deviceSuccessPath, { replace: true });
        return;
      }

      setToast(t('error.something_went_wrong'));
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
      setClientErrorKey('error.invalid_device_code');
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
