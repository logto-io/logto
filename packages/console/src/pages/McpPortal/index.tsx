import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';

type Upstream = {
  name: string;
  url: string;
  createdAt: string;
};

type UpstreamsResponse = {
  upstreams: Upstream[];
};

type ConnectionResponse = {
  configured: boolean;
  url?: string;
};

const connectionKey = 'api/mcp-portal/connection';
const listKey = 'api/mcp-portal/upstreams';

function SetupForm({ onConnected }: { readonly onConnected: () => Promise<void> }) {
  const api = useApi();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>();

  const connect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(undefined);

    try {
      await api.post(connectionKey, { json: { url, token } });
      await onConnected();
    } catch {
      setFormError(
        'Could not connect the portal. Check the URL and the setup token, then try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / MCP</div>
        <h2 className={styles.title}>Connect the MCP portal</h2>
        <p className={styles.description}>
          Enter the portal&apos;s HTTPS address and the one-time setup token. The token is printed
          in the portal log the first time it starts.
        </p>
      </div>

      <form className={styles.form} onSubmit={connect}>
        <label className={styles.field}>
          <span>Portal HTTPS URL</span>
          <input
            required
            type="url"
            value={url}
            placeholder="https://mcp-portal.example.com"
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Setup token</span>
          <input
            required
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
            }}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Connecting…' : 'Connect portal'}
        </button>
      </form>

      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}
    </div>
  );
}

function McpPortal() {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const connection = useSWR<ConnectionResponse, RequestError>(connectionKey);
  const isConfigured = connection.data?.configured === true;
  const { data, error, isLoading, mutate } = useSWR<UpstreamsResponse, RequestError>(
    isConfigured ? listKey : null
  );
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>();

  const [isResetOpen, setIsResetOpen] = useState(false);

  if (connection.error) {
    return <RequestDataError error={connection.error} />;
  }

  if (!connection.data) {
    return <p className={styles.muted}>Loading…</p>;
  }

  if (!isConfigured) {
    return (
      <SetupForm
        onConnected={async () => {
          await connection.mutate();
        }}
      />
    );
  }

  if (error) {
    return <RequestDataError error={error} />;
  }

  const resetConnection = async () => {
    setFormError(undefined);

    try {
      await api.delete(connectionKey);
      setIsResetOpen(false);
      await connection.mutate();
    } catch {
      setIsResetOpen(false);
      setFormError('Could not reset the portal connection. Try again.');
    }
  };

  const addUpstream = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(undefined);

    try {
      await api.post(listKey, { json: { name, url } });
      setName('');
      setUrl('');
      await mutate();
    } catch {
      setFormError('Could not add the MCP server. Check the name and URL, then try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeUpstream = async (upstream: Upstream) => {
    setFormError(undefined);

    try {
      await api.delete(`${listKey}/${encodeURIComponent(upstream.name)}`);
      await mutate();
    } catch {
      setFormError(`Could not remove "${upstream.name}". Try again.`);
    }
  };

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mcp_portal.page_title" />
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / MCP</div>
        <h2 className={styles.title}>MCP servers</h2>
        <p className={styles.description}>
          Add the MCP servers you want to reach through the portal. Each server is available only to
          you.
        </p>
        <div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => {
              setIsResetOpen(true);
            }}
          >
            Reset connection
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={addUpstream}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            required
            value={name}
            placeholder="my-server"
            pattern="[a-z][a-z0-9-]{0,31}"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>HTTPS URL</span>
          <input
            required
            type="url"
            value={url}
            placeholder="https://example.com/mcp"
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Adding…' : 'Add server'}
        </button>
      </form>

      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4}>Loading…</td>
              </tr>
            )}
            {!isLoading && (data?.upstreams.length ?? 0) === 0 && (
              <tr>
                <td colSpan={4} className={styles.muted}>
                  No MCP servers yet.
                </td>
              </tr>
            )}
            {data?.upstreams.map((upstream) => (
              <tr key={upstream.name}>
                <td>{upstream.name}</td>
                <td className={styles.muted}>{upstream.url}</td>
                <td className={styles.muted}>
                  {new Date(upstream.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => {
                      void removeUpstream(upstream);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        title="mcp_portal.reset_modal_title"
        confirmButtonText="mcp_portal.reset_modal_confirm"
        confirmButtonType="danger"
        isOpen={isResetOpen}
        onCancel={() => {
          setIsResetOpen(false);
        }}
        onConfirm={() => {
          void resetConnection();
        }}
      >
        {t('mcp_portal.reset_modal_content')}
      </ConfirmModal>
    </div>
  );
}

export default McpPortal;
