import {
  SupportedSigningKeyAlgorithm,
  OidcSigningKeyStatus,
  type OidcConfigKeysResponse,
  LogtoOidcConfigKeyType,
} from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import FormCard from '@/components/FormCard';
import { signingKeysLink } from '@/consts';
import Button from '@/ds-components/Button';
import DangerConfirmModal from '@/ds-components/DeleteConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import Select from '@/ds-components/Select';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import styles from './SigningKeysFormCard.module.scss';

const keyTypeTabs = [
  {
    keyType: LogtoOidcConfigKeyType.PrivateKeys,
    title: 'signing_keys.private_key',
    keyTypePhrase: 'private',
  },
  {
    keyType: LogtoOidcConfigKeyType.CookieKeys,
    title: 'signing_keys.cookie_key',
    keyTypePhrase: 'cookie',
  },
] as const;

const getSigningKeyTagStatus = (status?: OidcSigningKeyStatus) => {
  switch (status) {
    case OidcSigningKeyStatus.Current: {
      return 'success';
    }
    case OidcSigningKeyStatus.Next: {
      return 'info';
    }
    case OidcSigningKeyStatus.Previous: {
      return 'alert';
    }
    default: {
      return 'info';
    }
  }
};

const getSigningKeyLabel = (status?: OidcSigningKeyStatus) => {
  switch (status) {
    case OidcSigningKeyStatus.Current: {
      return 'status.current';
    }
    case OidcSigningKeyStatus.Next: {
      return 'status.next';
    }
    case OidcSigningKeyStatus.Previous: {
      return 'status.previous';
    }
    default: {
      return 'table_column.status';
    }
  }
};

function SigningKeysFormCard() {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.signing_keys' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const [activeTab, setActiveTab] = useState(LogtoOidcConfigKeyType.PrivateKeys);
  const activeTabConfig =
    activeTab === LogtoOidcConfigKeyType.PrivateKeys ? keyTypeTabs[0] : keyTypeTabs[1];
  const { keyTypePhrase } = activeTabConfig;
  const isPrivateKey = activeTab === LogtoOidcConfigKeyType.PrivateKeys;

  const { data, error, mutate } = useSWR<OidcConfigKeysResponse[], RequestError>(
    `api/configs/oidc/${activeTab}`
  );
  const [deletingKeyId, setDeletingKeyId] = useState<string>();
  const [showRotateConfirmModal, setShowRotateConfirmModal] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateKeyAlgorithm, setRotateKeyAlgorithm] = useState<SupportedSigningKeyAlgorithm>(
    SupportedSigningKeyAlgorithm.EC
  );

  const isLoadingKeys = !data && !error;

  const tableColumns = useMemo(
    () => [
      {
        title: String(t('table_column.id')),
        dataIndex: 'id',
        colSpan: 8,
        render: ({ id }: OidcConfigKeysResponse) => <span className={styles.idWrapper}>{id}</span>,
      },
      {
        title: String(t('table_column.status')),
        dataIndex: 'status',
        colSpan: 4,
        render: ({ status }: OidcConfigKeysResponse, rowIndex: number) => (
          <Tag
            type="state"
            variant="plain"
            status={
              isPrivateKey ? getSigningKeyTagStatus(status) : rowIndex === 0 ? 'success' : 'alert'
            }
          >
            {t(
              isPrivateKey
                ? getSigningKeyLabel(status)
                : rowIndex === 0
                  ? 'status.current'
                  : 'status.previous'
            )}
          </Tag>
        ),
      },
      ...condArray(
        isPrivateKey && [
          {
            title: String(t('table_column.algorithm')),
            dataIndex: 'signingKeyAlgorithm',
            colSpan: 7,
            render: ({ signingKeyAlgorithm }: OidcConfigKeysResponse) => (
              <span>{signingKeyAlgorithm}</span>
            ),
          },
        ]
      ),
      {
        title: '',
        dataIndex: 'action',
        colSpan: 2,
        render: ({ id, status }: OidcConfigKeysResponse, rowIndex: number) =>
          (isPrivateKey ? status === OidcSigningKeyStatus.Previous : rowIndex !== 0) && (
            <div className={styles.deleteIcon}>
              <IconButton
                onClick={() => {
                  setDeletingKeyId(id);
                }}
              >
                <Delete />
              </IconButton>
            </div>
          ),
      },
    ],
    [isPrivateKey, t]
  );

  return (
    <FormCard
      title="signing_keys.title"
      description="signing_keys.description"
      learnMoreLink={{ href: getDocumentationUrl(signingKeysLink), targetBlank: 'noopener' }}
    >
      <TabNav className={styles.tabs}>
        {keyTypeTabs.map(({ keyType, title }) => (
          <TabNavItem
            key={keyType}
            isActive={activeTab === keyType}
            onClick={() => {
              setActiveTab(keyType);
            }}
          >
            <DynamicT forKey={title} />
          </TabNavItem>
        ))}
      </TabNav>
      <FormField title={`signing_keys.${keyTypePhrase}_keys_in_use`}>
        <Table
          hasBorder
          isRowHoverEffectDisabled
          isLoading={isLoadingKeys || isRotating}
          errorMessage={error?.body?.message ?? error?.message}
          rowIndexKey="id"
          rowGroups={[{ key: 'signing_keys', data }]}
          columns={tableColumns}
        />
      </FormField>
      <FormField title={`signing_keys.rotate_${keyTypePhrase}_keys`}>
        <div className={styles.rotateKey}>
          <div className={styles.description}>{t(`rotate_${keyTypePhrase}_keys_description`)}</div>
          <Button
            title={`signing_keys.rotate_${keyTypePhrase}_keys`}
            type="default"
            onClick={() => {
              setShowRotateConfirmModal(true);
            }}
          />
        </div>
      </FormField>
      <DangerConfirmModal
        confirmButtonText="signing_keys.rotate_button"
        isOpen={showRotateConfirmModal}
        onCancel={() => {
          setShowRotateConfirmModal(false);
        }}
        onConfirm={async () => {
          setIsRotating(true);
          setShowRotateConfirmModal(false);
          try {
            const keys = await api
              .post(`api/configs/oidc/${activeTab}/rotate`, {
                json: { signingKeyAlgorithm: rotateKeyAlgorithm },
              })
              .json<OidcConfigKeysResponse[]>();
            void mutate(keys);
            toast.success(String(t('messages.rotate_key_success')));
          } finally {
            setIsRotating(false);
          }
        }}
      >
        <span>
          <Trans components={{ strong: <strong /> }}>
            {t(`reminder.rotate_${keyTypePhrase}_key`)}
          </Trans>
        </span>
        {isPrivateKey && (
          <FormField title="signing_keys.select_private_key_algorithm">
            <Select
              options={Object.values(SupportedSigningKeyAlgorithm).map((value) => ({
                title: value,
                value,
              }))}
              value={rotateKeyAlgorithm}
              onChange={(value) => {
                if (!value) {
                  return;
                }
                setRotateKeyAlgorithm(value);
              }}
            />
          </FormField>
        )}
      </DangerConfirmModal>
      <DangerConfirmModal
        isOpen={Boolean(deletingKeyId)}
        onCancel={() => {
          setDeletingKeyId(undefined);
        }}
        onConfirm={async () => {
          if (!deletingKeyId) {
            return;
          }
          try {
            await api.delete(`api/configs/oidc/${activeTab}/${deletingKeyId}`);
            void mutate(data?.filter((key) => key.id !== deletingKeyId));
            toast.success(String(t('messages.delete_key_success')));
          } finally {
            setDeletingKeyId(undefined);
          }
        }}
      >
        <span>
          <Trans components={{ strong: <strong /> }}>
            {t(`reminder.delete_${keyTypePhrase}_key`)}
          </Trans>
        </span>
      </DangerConfirmModal>
    </FormCard>
  );
}

export default SigningKeysFormCard;
