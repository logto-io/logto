import { useState } from 'react';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import RequestDataError from '@/components/RequestDataError';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DangerousRaw from '@/ds-components/DangerousRaw';
import ModalLayout from '@/ds-components/ModalLayout';
import Table from '@/ds-components/Table';
import useApi from '@/hooks/use-api';
import { type RequestError } from '@/hooks/use-api';
import pageLayout from '@/scss/page-layout.module.scss';

import { AddPortalModal, BaseDomainForm } from './PortalForms';
import ServerIcon from './ServerIcon';
import styles from './index.module.scss';
import {
  type Portal,
  type PortalSettings,
  type PortalsResponse,
  portalsKey,
  settingsKey,
} from './types';

const documentationUrl = 'https://docs.meshx.io/';

// The portal list. Opening a portal shows its servers; adding one creates a hostname under the base domain.
function PortalList({ onOpen }: { readonly onOpen: (portal: Portal) => void }) {
  const api = useApi();
  const { data, error, isLoading, mutate } = useSWR<PortalsResponse, RequestError>(portalsKey);
  const { data: settings, mutate: refreshSettings } = useSWR<PortalSettings, RequestError>(
    settingsKey
  );
  const [removing, setRemoving] = useState<Portal>();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBaseDomainOpen, setIsBaseDomainOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState<string>();
  const [copied, setCopied] = useState<string>();

  if (error) {
    return <RequestDataError error={error} />;
  }

  const removePortal = async (portal: Portal) => {
    setFormError(undefined);

    try {
      await api.delete(`${portalsKey}/${encodeURIComponent(portal.id)}`);
      setRemoving(undefined);
      await mutate();
    } catch {
      setRemoving(undefined);
      setFormError(`Could not remove "${portal.name}". Try again.`);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      setCopied(undefined);
    }
  };

  const query = search.trim().toLowerCase();
  const portals = (data?.portals ?? []).filter(
    ({ name, hostname }) =>
      !query || name.toLowerCase().includes(query) || hostname.toLowerCase().includes(query)
  );

  return (
    <div className={pageLayout.container}>
      <div className={pageLayout.headline}>
        <CardTitle
          title={<DangerousRaw>MCP Server Portals</DangerousRaw>}
          subtitle={
            <DangerousRaw>
              Create a single endpoint for multiple MCP (Model Context Protocol) servers. Server
              portals help to streamline visibility and security of your AI infrastructure.
            </DangerousRaw>
          }
          learnMoreLink={{ href: documentationUrl }}
        />
        <Button
          icon={<Plus />}
          type="primary"
          size="large"
          title={<DangerousRaw>Add server portal</DangerousRaw>}
          onClick={() => {
            setIsAddOpen(true);
          }}
        />
      </div>

      <div className={styles.searchBox}>
        <input
          type="search"
          value={search}
          placeholder="Search portal"
          aria-label="Search portal"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
      </div>

      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}

      <Table
        className={pageLayout.table}
        rowGroups={[{ key: 'portals', data: portals }]}
        rowIndexKey="id"
        isLoading={isLoading}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            colSpan: 5,
            render: (portal) => (
              <div className={styles.portalName}>
                <ServerIcon name={portal.name} />
                <button
                  type="button"
                  className={styles.portalLink}
                  onClick={() => {
                    onOpen(portal);
                  }}
                >
                  {portal.name}
                </button>
              </div>
            ),
          },
          {
            title: 'URL',
            dataIndex: 'hostname',
            colSpan: 9,
            render: ({ hostname }) => {
              const url = `https://${hostname}/mcp`;

              return (
                <span className={styles.urlCell}>
                  {url}
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Copy ${url}`}
                    onClick={() => {
                      void copyUrl(url);
                    }}
                  >
                    {copied === url ? '✓' : '⧉'}
                  </button>
                </span>
              );
            },
          },
          {
            title: 'Description',
            dataIndex: 'createdAt',
            colSpan: 6,
            render: () => <span className={styles.muted}>--</span>,
          },
          {
            title: 'Actions',
            dataIndex: 'id',
            colSpan: 4,
            render: (portal) => (
              <Button
                type="text"
                size="small"
                title={<DangerousRaw>Remove</DangerousRaw>}
                onClick={() => {
                  setRemoving(portal);
                }}
              />
            ),
          },
        ]}
        placeholder={
          <div className={styles.muted}>
            {query ? 'No portals match your search.' : 'No portals yet. Add one above.'}
          </div>
        }
        onRetry={async () => mutate(undefined, true)}
      />

      <div className={styles.baseDomainNote}>
        {settings?.baseDomain ? (
          <>
            Portals are created under <strong>{settings.baseDomain}</strong>.{' '}
            <button
              type="button"
              className={styles.remove}
              onClick={() => {
                setIsBaseDomainOpen(true);
              }}
            >
              Change base domain
            </button>
          </>
        ) : (
          <span className={styles.muted}>No base domain set yet.</span>
        )}
      </div>

      {isAddOpen && (
        <AddPortalModal
          baseDomain={settings?.baseDomain}
          onClose={() => {
            setIsAddOpen(false);
          }}
          onCreated={async () => {
            await mutate();
          }}
          onBaseDomainSaved={async () => {
            await refreshSettings();
          }}
        />
      )}

      {isBaseDomainOpen && (
        <ModalLayout
          title={<>Base domain</>}
          size="medium"
          onClose={() => {
            setIsBaseDomainOpen(false);
          }}
        >
          <BaseDomainForm
            baseDomain={settings?.baseDomain}
            onSaved={async () => {
              await refreshSettings();
              setIsBaseDomainOpen(false);
            }}
          />
        </ModalLayout>
      )}

      <ConfirmModal
        title={<>Remove this portal?</>}
        confirmButtonText={<>Remove portal</>}
        confirmButtonType="danger"
        isOpen={Boolean(removing)}
        onCancel={() => {
          setRemoving(undefined);
        }}
        onConfirm={() => {
          if (removing) {
            void removePortal(removing);
          }
        }}
      >
        {`"${removing?.name ?? ''}" and its server list stop answering at ${removing?.hostname ?? ''}.`}
      </ConfirmModal>
    </div>
  );
}

export default PortalList;
