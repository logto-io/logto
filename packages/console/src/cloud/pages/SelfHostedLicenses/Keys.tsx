import { HTTPError } from 'ky';
import { useRef, useState } from 'react';
import { type z } from 'zod';

import { selfHostedLicenseKeysGuard } from '@/cloud/types/self-hosted-license';
import { cloudApi } from '@/consts';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import { useStaticApi } from '@/hooks/use-api';

import styles from './index.module.scss';

type Props = { readonly id: string };

function Keys({ id }: Props) {
  const api = useStaticApi({ resourceIndicator: cloudApi.indicator, hideErrorToast: true });
  const [keys, setKeys] = useState<z.infer<typeof selfHostedLicenseKeysGuard>>();
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
      setKeys(
        selfHostedLicenseKeysGuard.parse(
          await api
            .post(`/api/me/self-hosted-licenses/${encodeURIComponent(id)}/keys`, {
              // Issuance must only happen on an explicit click, never an HTTP retry.
              retry: 0,
              cache: 'no-store',
            })
            .json()
        )
      );
    } catch (error: unknown) {
      setError(
        error instanceof HTTPError && error.response.status === 403 ? 'unavailable' : 'failed'
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
