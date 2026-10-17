import { useState } from 'react';
import useSWR from 'swr';

import useApi from '@/hooks/use-api';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';
import { type Upstream, type ToolsResponse } from './types';

// One server's tools, each with its own switch. Opening the list asks the portal for the tools.
function UpstreamTools({
  listKey,
  upstream,
  onChanged,
}: {
  readonly listKey: string;
  readonly upstream: Upstream;
  readonly onChanged: () => Promise<unknown>;
}) {
  const api = useApi();
  const toolsKey = `${listKey}/${encodeURIComponent(upstream.name)}/tools`;
  const { data, error, isLoading, mutate } = useSWR<ToolsResponse, RequestError>(toolsKey);
  const [saveError, setSaveError] = useState<string>();

  const setToolEnabled = async (toolName: string, enabled: boolean) => {
    const disabled = new Set(upstream.disabledTools ?? []);

    if (enabled) {
      disabled.delete(toolName);
    } else {
      disabled.add(toolName);
    }

    setSaveError(undefined);

    try {
      await api.patch(`${listKey}/${encodeURIComponent(upstream.name)}`, {
        json: { disabledTools: [...disabled] },
      });
      await Promise.all([onChanged(), mutate()]);
    } catch {
      setSaveError(`Could not update "${toolName}". Try again.`);
    }
  };

  if (isLoading) {
    return <p className={styles.muted}>Loading tools…</p>;
  }

  if (error) {
    return <p className={styles.error}>Could not load tools. The server may be offline.</p>;
  }

  return (
    <div>
      {(data?.tools.length ?? 0) === 0 && <p className={styles.muted}>This server has no tools.</p>}
      {data?.tools.map((tool) => (
        <div key={tool.name} className={styles.toolRow}>
          <div>
            <div>{tool.name}</div>
            {tool.description && <div className={styles.muted}>{tool.description}</div>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={tool.enabled}
            aria-label={`${tool.name} enabled`}
            className={styles.toggle}
            data-on={tool.enabled}
            onClick={() => {
              void setToolEnabled(tool.name, !tool.enabled);
            }}
          >
            <span />
          </button>
        </div>
      ))}
      {saveError && (
        <p role="alert" className={styles.error}>
          {saveError}
        </p>
      )}
    </div>
  );
}

export default UpstreamTools;
