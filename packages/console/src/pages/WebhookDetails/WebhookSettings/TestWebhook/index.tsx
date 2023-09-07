import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import { type WebhookDetailsFormType } from '@/pages/WebhookDetails/types';
import { webhookDetailsParser } from '@/pages/WebhookDetails/utils';

import * as styles from './index.module.scss';

type Props = {
  hookId: string;
};

function TestWebhook({ hookId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    getValues,
    formState: { isValid },
  } = useFormContext<WebhookDetailsFormType>();

  const [isSendingPayload, setIsSendingPayload] = useState(false);
  const api = useApi();

  const sendTestPayload = async () => {
    if (isSendingPayload) {
      return;
    }

    setIsSendingPayload(true);

    try {
      const formData = getValues();
      const { events, config } = webhookDetailsParser.toRemoteModel(formData);
      await api.post(`api/hooks/${hookId}/test`, { json: { events, config } });
      toast.success(t('webhook_details.settings.test_payload_sent'));
    } finally {
      setIsSendingPayload(false);
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
    </FormField>
  );
}

export default TestWebhook;
