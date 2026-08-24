import type { TrustedDeviceResponse } from '@logto/schemas';
import { getDeviceDisplayInfo } from '@logto/shared/universal';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import { defaultPageSize } from '@/consts';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { buildUrl } from '@/utils/url';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

type TrustedDeviceTableRow = TrustedDeviceResponse & {
  readonly name?: string;
  readonly location?: string;
};

const pageSize = defaultPageSize;

function UserTrustedDevices({ userId }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [page, setPage] = useState(1);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string>();
  const expiryDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [i18n.language]
  );

  const { data, error, mutate } = useSWR<[TrustedDeviceResponse[], number], RequestError>(
    buildUrl(`api/users/${userId}/trusted-devices`, {
      page: String(page),
      page_size: String(pageSize),
    })
  );

  const isLoading = !data && !error;
  const [trustedDevices, totalCount] = data ?? [[], 0];
  const rows = useMemo(
    () =>
      trustedDevices.map<TrustedDeviceTableRow>((trustedDevice) => {
        const { userAgent, country, city } = trustedDevice;

        return {
          ...trustedDevice,
          ...getDeviceDisplayInfo({
            userAgent: userAgent ?? undefined,
            country: country ?? undefined,
            city: city ?? undefined,
          }),
        };
      }),
    [trustedDevices]
  );
  const hasRows = rows.length > 0;

  const api = useApi();
  const { show: showConfirm } = useConfirmModal();

  const handleRemove = useCallback(
    async (trustedDevice: TrustedDeviceTableRow) => {
      const [confirmed] = await showConfirm({
        ModalContent: t('mfa.trusted_device.management_deletion_confirmation', {
          name: trustedDevice.name ?? trustedDevice.id,
        }),
        confirmButtonText: 'general.remove',
      });

      if (!confirmed) {
        return;
      }

      setDeletingDeviceId(trustedDevice.id);

      try {
        await api.delete(`api/users/${userId}/trusted-devices/${trustedDevice.id}`);
        toast.success(t('mfa.trusted_device.management_removed'));

        if (rows.length === 1 && page > 1) {
          setPage(page - 1);
          return;
        }

        await mutate();
      } catch {
        // Request errors are surfaced by useApi's global error handler.
      } finally {
        setDeletingDeviceId(undefined);
      }
    },
    [api, mutate, page, rows.length, showConfirm, t, userId]
  );

  return (
    <FormCard
      title="mfa.trusted_device.title"
      description="mfa.trusted_device.management_description"
    >
      <FormField title="mfa.trusted_device.title">
        {!isLoading && !error && (
          <div className={styles.description}>
            {t(
              hasRows ? 'mfa.trusted_device.management_hint' : 'mfa.trusted_device.management_empty'
            )}
          </div>
        )}
        {(isLoading || hasRows || error) && (
          <Table
            hasBorder
            isRowHoverEffectDisabled
            rowGroups={[{ key: 'trustedDevices', data: rows }]}
            rowIndexKey="id"
            isLoading={isLoading}
            errorMessage={error?.body?.message ?? error?.message}
            columns={[
              {
                title: t('user_details.sessions.name_column'),
                dataIndex: 'name',
                colSpan: 7,
                render: ({ id, name }) => (
                  <div className={styles.name}>
                    <span>{name ?? '-'}</span>
                    <span className={styles.id}>{id}</span>
                  </div>
                ),
              },
              {
                title: t('user_details.sessions.location_column'),
                dataIndex: 'location',
                colSpan: 5,
                render: ({ location }) => location ?? '-',
              },
              {
                title: t('user_details.personal_access_tokens.expires_at'),
                dataIndex: 'expiresAt',
                colSpan: 4,
                render: ({ expiresAt }) => expiryDateFormatter.format(expiresAt),
              },
              {
                title: null,
                dataIndex: 'action',
                colSpan: 2,
                render: (trustedDevice) => (
                  <div className={styles.action}>
                    <Button
                      title="general.remove"
                      type="text"
                      size="small"
                      isLoading={deletingDeviceId === trustedDevice.id}
                      onClick={() => {
                        void handleRemove(trustedDevice);
                      }}
                    />
                  </div>
                ),
              },
            ]}
            pagination={{
              page,
              pageSize,
              totalCount,
              onChange: setPage,
            }}
            onRetry={() => {
              void mutate();
            }}
          />
        )}
      </FormField>
    </FormCard>
  );
}

export default UserTrustedDevices;
