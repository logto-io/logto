import { type FormEvent, useState } from 'react';
import useSWR from 'swr';

import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import DangerousRaw from '@/ds-components/DangerousRaw';
import useApi from '@/hooks/use-api';
import { type RequestError } from '@/hooks/use-api';

import PortalAccess from './PortalAccess';
import PortalConnect, { SetupBanner } from './PortalConnect';
import ServerAccess from './ServerAccess';
import ServerCredential from './ServerCredential';
import UpstreamTools from './UpstreamTools';
import ServerIcon from './ServerIcon';
import styles from './index.module.scss';
import { type Portal, type Upstream, type UpstreamsResponse, listKeyFor } from './types';

// One portal's servers. Adding, switching and removing servers apply to this portal only.
function PortalServers({
  portal,
  backLink,
}: {
  readonly portal: Portal;
  readonly backLink: string;
}) {
  const api = useApi();
  const listKey = listKeyFor(portal.id);
  const { data, error, isLoading, mutate } = useSWR<UpstreamsResponse, RequestError>(listKey);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>();
  // Shown while a just-added server does not answer. Cleared on reload, since the list does not track it.
  const [notice, setNotice] = useState<string>();
  const [unreachable, setUnreachable] = useState<string[]>([]);
  const [openTools, setOpenTools] = useState<string>();

  if (error) {
    return <RequestDataError error={error} />;
  }

  const addUpstream = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(undefined);
    setNotice(undefined);

    try {
      const added = await api
        .post(listKey, { json: { name, url } })
        .json<{ reachable?: boolean }>();
      setName('');
      setUrl('');
      await mutate();

      if (added.reachable === false) {
        setNotice(
          `Saved "${name}", but it did not answer. It shows as unreachable until its URL responds.`
        );
        setUnreachable((current) => [...current, name]);
      }
    } catch {
      setFormError('Could not add the MCP server. Check the name and URL, then try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const setUpstreamEnabled = async (upstream: Upstream, enabled: boolean) => {
    setFormError(undefined);

    try {
      await api.patch(`${listKey}/${encodeURIComponent(upstream.name)}`, { json: { enabled } });
      await mutate();
    } catch {
      setFormError(`Could not turn "${upstream.name}" ${enabled ? 'on' : 'off'}. Try again.`);
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
    <DetailsPage backLink={backLink} backLinkTitle={<DangerousRaw>Back to portals</DangerousRaw>}>
      <PageMeta titleKey="mcp_portal.page_title" />
      <DetailsPageHeader
        title={portal.name}
        primaryTag={portal.hostname}
        identifier={{ name: 'ID', value: portal.id }}
        subtitle={`${data?.upstreams.filter((item) => item.enabled !== false).length ?? 0} of ${data?.upstreams.length ?? 0} servers on`}
      />
      <div className={styles.container}>
        <SetupBanner portal={portal} />
        <PortalConnect portal={portal} />

        <PortalAccess portal={portal} />

        <FormCard title={<DangerousRaw>MCP servers</DangerousRaw>}>
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
          {notice && (
            <p role="status" className={styles.warning}>
              {notice}
            </p>
          )}

          <div className={styles.serverList}>
            {isLoading && <p className={styles.muted}>Loading…</p>}
            {!isLoading && (data?.upstreams.length ?? 0) === 0 && (
              <p className={styles.muted}>No MCP servers yet. Add one above.</p>
            )}
            {data?.upstreams.map((upstream) => {
              const enabled = upstream.enabled !== false;
              const isOpen = openTools === upstream.name;
              return (
                <section key={upstream.name} className={styles.serverCard}>
                  <div className={styles.serverHead}>
                    <ServerIcon name={upstream.name} />
                    <span
                      className={styles.statusDot}
                      data-on={enabled}
                      data-warning={enabled && unreachable.includes(upstream.name)}
                      aria-hidden="true"
                    />
                    <div className={styles.serverText}>
                      <div className={styles.serverName}>{upstream.name}</div>
                      <div className={styles.muted}>{upstream.url}</div>
                    </div>
                    <div className={styles.serverActions}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={`${upstream.name} enabled`}
                        className={styles.toggle}
                        data-on={enabled}
                        onClick={() => {
                          void setUpstreamEnabled(upstream, !enabled);
                        }}
                      >
                        <span />
                      </button>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => {
                          setOpenTools((current) =>
                            current === upstream.name ? undefined : upstream.name
                          );
                        }}
                      >
                        {isOpen ? 'Hide tools' : 'Tools'}
                      </button>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => {
                          void removeUpstream(upstream);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className={styles.serverBody}>
                      <UpstreamTools listKey={listKey} upstream={upstream} onChanged={mutate} />
                      <ServerAccess listKey={listKey} upstream={upstream} onSaved={mutate} />
                      <ServerCredential listKey={listKey} upstream={upstream} onSaved={mutate} />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </FormCard>
      </div>
    </DetailsPage>
  );
}

export default PortalServers;
