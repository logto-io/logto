import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import { ResponseError } from '@withtyped/client';
import { useRef, useState } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SelfHostedLicenseKeys } from '@/cloud/types/router';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';

import styles from './index.module.scss';

type Props = { readonly id: string };

function Keys({ id }: Props) {
  const api = useCloudApi<typeof selfHostedLicensesRouter>({ hideErrorToast: true });
  const [keys, setKeys] = useState<SelfHostedLicenseKeys>();
  const [error, setError] = useState<'unavailable' | 'failed'>();
  const [isIssuing, setIsIssuing] = useState(false);
  const pending = useRef(false);

  const issueKeys = async () => {
    if (pending.current) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation -- Lock before React renders the disabled button.
    pending.current = true;
    setIsIssuing(true);
    setError(undefined);

    try {
      // The client does not retry requests; the endpoint returns Cache-Control: no-store.
      const pair = await api.post('/api/me/self-hosted-licenses/:id/keys', { params: { id } });
      // Router types do not validate responses at runtime. Never expose a partial pair.
      if (typeof pair.productionKey !== 'string' || typeof pair.nonProductionKey !== 'string') {
        throw new TypeError('Incomplete license key pair.');
      }
      setKeys(pair);
    } catch (error: unknown) {
      setError(
        error instanceof ResponseError && error.response.status === 403 ? 'unavailable' : 'failed'
      );
    } finally {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the single-flight lock after settlement.
      pending.current = false;
      setIsIssuing(false);
    }
  };

  return (
    <div className={styles.keys}>
      {keys ? (
        <>
          <FormField title="cloud.self_hosted_licenses.production_key">
            <CopyToClipboard hasVisibilityToggle displayType="block" value={keys.productionKey} />
          </FormField>
          <FormField title="cloud.self_hosted_licenses.non_production_key">
            <CopyToClipboard
              hasVisibilityToggle
              displayType="block"
              value={keys.nonProductionKey}
            />
          </FormField>
        </>
      ) : (
        <>
          {error && (
            <InlineNotification severity="error">
              <DynamicT
                forKey={
                  error === 'unavailable'
                    ? 'cloud.self_hosted_licenses.keys_unavailable'
                    : 'cloud.self_hosted_licenses.issue_error'
                }
              />
            </InlineNotification>
          )}
          {error !== 'unavailable' && (
            <div>
              <Button
                title="cloud.self_hosted_licenses.issue_keys"
                type="primary"
                isLoading={isIssuing}
                onClick={() => {
                  void issueKeys();
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Keys;
