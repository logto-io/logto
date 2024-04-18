import { hookTestErrorResponseDataGuard, type RequestErrorBody } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { HTTPError } from 'ky';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import useApi from '@/hooks/use-api';
import { type WebhookDetailsFormType } from '@/pages/WebhookDetails/types';
import { webhookDetailsParser } from '@/pages/WebhookDetails/utils';

import * as styles from './index.module.scss';
import useWebhookTestResult from './use-webhook-test-result';

type Props = {
  readonly hookId: string;
};

function TestWebhook({ hookId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    getValues,
    formState: { isValid },
  } = useFormContext<WebhookDetailsFormType>();
  const testResultRef = useRef<HTMLDivElement>(null);

  const { result, setResult } = useWebhookTestResult();

  const [isSendingPayload, setIsSendingPayload] = useState(false);
  const api = useApi({ hideErrorToast: true });

  const sendTestPayload = async () => {
    if (isSendingPayload) {
      return;
    }

    setIsSendingPayload(true);

    const endpointUrl = getValues('url');
    const requestTime = Date.now();

    try {
      const formData = getValues();
      const { events, config } = webhookDetailsParser.toRemoteModel(formData);
      await api.post(`api/hooks/${hookId}/test`, { json: { events, config } });

      setResult({
        result: 'success',
        endpointUrl,
        message: t('webhook_details.settings.test_result.test_success'),
        requestTime,
      });
    } catch (error: unknown) {
      if (!(error instanceof HTTPError)) {
        toast.error(error instanceof Error ? String(error) : t('general.unknown_error'));
        return;
      }

      const { code, data, message } = await error.response.clone().json<RequestErrorBody>();

      if (code === 'hook.send_test_payload_failed') {
        setResult({
          result: 'error',
          endpointUrl,
          requestTime,
          message,
        });
        return;
      }

      if (code === 'hook.endpoint_responded_with_error') {
        const { responseStatus, responseBody } =
          trySafe(() => hookTestErrorResponseDataGuard.parse(data)) ?? {};

        setResult({
          result: 'error',
          endpointUrl,
          requestTime,
          message,
          responseStatus,
          responseBody,
        });

        return;
      }

      throw error;
    } finally {
      setIsSendingPayload(false);
      // Set timeout to wait for the notification to be rendered
      setTimeout(() => {
        testResultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <FormField title="webhook_details.settings.test_webhook">
      <div className={styles.container}>
        <div className={styles.description}>
          <DynamicT forKey="webhook_details.settings.test_webhook_description" />
        </div>
        <Button
          type="outline"
          title="webhook_details.settings.send_test_payload"
          disabled={!isValid}
          isLoading={isSendingPayload}
          onClick={async () => {
            await sendTestPayload();
          }}
        />
      </div>
      {result && (
        <InlineNotification
          ref={testResultRef}
          hasIcon
          severity={result.result}
          action="general.got_it"
          className={styles.result}
          onClick={() => {
            setResult(undefined);
          }}
        >
          <div>
            <DynamicT
              forKey="webhook_details.settings.test_result.endpoint_url"
              interpolation={{ url: result.endpointUrl }}
            />
          </div>
          {result.message && (
            <div>
              <DynamicT
                forKey="webhook_details.settings.test_result.message"
                interpolation={{ message: result.message }}
              />
            </div>
          )}
          {result.responseStatus && (
            <div>
              <DynamicT
                forKey="webhook_details.settings.test_result.response_status"
                interpolation={{ status: result.responseStatus }}
              />
            </div>
          )}
          {result.responseBody && (
            <div>
              <DynamicT
                forKey="webhook_details.settings.test_result.response_body"
                interpolation={{ body: result.responseBody }}
              />
            </div>
          )}
          <div>
            <DynamicT
              forKey="webhook_details.settings.test_result.request_time"
              interpolation={{ time: dayjs(result.requestTime).format('MM/DD/YYYY, hh:mm:ss A') }}
            />
          </div>
        </InlineNotification>
      )}
    </FormField>
  );
}

export default TestWebhook;
