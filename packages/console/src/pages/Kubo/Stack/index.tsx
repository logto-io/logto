import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import Button from '@/ds-components/Button';
import useApi, { type RequestError } from '@/hooks/use-api';

import styles from '../index.module.scss';

type KuboCondition = { type: string; status: string; reason?: string; message?: string };

type KuboComponent = {
  name: string;
  phase: string;
  revision?: number;
  message?: string;
  dependsOn?: string[];
};

type KuboStackDetail = {
  namespace: string;
  name: string;
  mode: string;
  phase: string;
  ready: number;
  total: number;
  failing?: string[] | null;
  paused?: boolean;
  computeMonthlyUsd?: number;
  requestedCpuMilli?: number;
  requestedMemoryBytes?: number;
  bundle?: string;
  gitManaged?: boolean;
  exclude?: string[] | null;
  operators?: Record<string, boolean> | null;
  featureFlags?: Record<string, string> | null;
  imageTags?: Record<string, string> | null;
  chartVersions?: Record<string, string> | null;
  conditions?: KuboCondition[] | null;
  components?: KuboComponent[] | null;
};

const modes = ['Direct', 'Flux'];

const formatUsd = (value?: number) => (value === undefined ? '—' : `$${value.toFixed(2)}/mo`);
const formatGiB = (bytes?: number) =>
  bytes === undefined ? '—' : `${(bytes / 1024 ** 3).toFixed(1)} GiB`;

// A card with a title, a read view, and an edit view that saves only its own field.
const Section = ({
  title,
  view,
  editor,
  onEdit,
  editing,
  onSave,
  onCancel,
  saving,
  error,
}: {
  title: string;
  view: React.ReactNode;
  editor?: React.ReactNode;
  onEdit?: () => void;
  editing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
  error?: string;
}) => (
  <div className={styles.card}>
    <div className={styles.sectionHeader}>
      <span className={styles.cardTitle}>{title}</span>
      {onEdit && !editing && (
        <Button title="general.edit" type="outline" size="small" onClick={onEdit} />
      )}
    </div>
    <div className={styles.sectionBody}>{editing ? editor : view}</div>
    {error && <p className={styles.error}>{error}</p>}
    {editing && (
      <div className={styles.actions}>
        <Button title="general.cancel" type="outline" onClick={onCancel} />
        <Button title="general.save" type="primary" isLoading={saving} onClick={onSave} />
      </div>
    )}
  </div>
);

// Editable name → value rows. The portal replaces the whole map on save.
const KeyValueEditor = ({
  rows,
  onChange,
}: {
  rows: Array<{ key: string; value: string }>;
  onChange: (rows: Array<{ key: string; value: string }>) => void;
}) => (
  <div className={styles.kvEditor}>
    {rows.map((row, index) => (
      <div key={index} className={styles.kvRow}>
        <input
          value={row.key}
          placeholder="name"
          onChange={(event) => {
            onChange(rows.map((r, i) => (i === index ? { ...r, key: event.target.value } : r)));
          }}
        />
        <input
          value={row.value}
          placeholder="value"
          onChange={(event) => {
            onChange(rows.map((r, i) => (i === index ? { ...r, value: event.target.value } : r)));
          }}
        />
        <Button
          title="general.delete"
          type="text"
          size="small"
          onClick={() => {
            onChange(rows.filter((_, i) => i !== index));
          }}
        />
      </div>
    ))}
    <Button
      title="general.add"
      type="text"
      size="small"
      onClick={() => {
        onChange([...rows, { key: '', value: '' }]);
      }}
    />
  </div>
);

const toRows = (values?: Record<string, string> | null) =>
  Object.entries(values ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value }));

const toMap = (rows: Array<{ key: string; value: string }>) =>
  Object.fromEntries(
    rows.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
  );

const KeyValueView = ({ values }: { values?: Record<string, string> | null }) => {
  const entries = toRows(values);
  if (entries.length === 0) {
    return <p className={styles.muted}>None set.</p>;
  }
  return (
    <table className={styles.table}>
      <tbody>
        {entries.map(({ key, value }) => (
          <tr key={key}>
            <td>{key}</td>
            <td className={styles.muted}>{value || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Keeps each card's draft state and saves its own field.
const useEditable = <T,>(
  initial: () => T,
  field: string,
  save: (body: Record<string, unknown>) => Promise<void>
) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  return {
    editing,
    draft,
    setDraft,
    saving,
    error,
    start: () => {
      setDraft(initial());
      setError(undefined);
      setEditing(true);
    },
    cancel: () => {
      setEditing(false);
      setError(undefined);
    },
    commit: async (body: unknown) => {
      setSaving(true);
      setError(undefined);
      try {
        await save({ [field]: body });
        setEditing(false);
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
  };
};

function Stack() {
  const { namespace = '', name = '' } = useParams();
  const api = useApi();
  const { data, error, isLoading, mutate } = useSWR<KuboStackDetail, RequestError>(
    namespace && name ? `api/kubo/stacks/${namespace}/${name}` : null
  );
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapJob, setBootstrapJob] = useState<string>();
  const [bootstrapError, setBootstrapError] = useState<string>();

  const patch = async (body: Record<string, unknown>) => {
    await api.patch(`api/kubo/stacks/${namespace}/${name}`, { json: body }).json();
    await mutate();
  };

  const bundle = useEditable(() => data?.bundle ?? '', 'bundle', patch);
  const mode = useEditable(() => data?.mode ?? 'Direct', 'mode', patch);
  const exclude = useEditable(() => (data?.exclude ?? []).join(', '), 'exclude', patch);
  const operators = useEditable(() => ({ ...(data?.operators ?? {}) }), 'operators', patch);
  const flags = useEditable<Array<{ key: string; value: string }>>(
    () => toRows(data?.featureFlags),
    'featureFlags',
    patch
  );
  const tags = useEditable<Array<{ key: string; value: string }>>(
    () => toRows(data?.imageTags),
    'imageTags',
    patch
  );
  const charts = useEditable<Array<{ key: string; value: string }>>(
    () => toRows(data?.chartVersions),
    'chartVersions',
    patch
  );

  const runBootstrap = async () => {
    // Bootstrap re-runs the workspace's initial setup jobs, so confirm before starting it.
    if (!window.confirm(`Run bootstrap for ${name}?`)) {
      return;
    }
    setBootstrapping(true);
    setBootstrapError(undefined);
    try {
      const result = await api
        .post(`api/kubo/stacks/${namespace}/${name}/bootstrap`)
        .json<{ job: string }>();
      setBootstrapJob(result.job);
    } catch (error_: unknown) {
      setBootstrapError(error_ instanceof Error ? error_.message : 'Bootstrap failed');
    } finally {
      setBootstrapping(false);
    }
  };

  if (error) {
    return <RequestDataError error={error} />;
  }

  return (
    <div className={styles.container}>
      <Helmet title={`MeshX · ${name}`} />
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / Workspaces / {namespace}</div>
        <h2 className={styles.title}>{name}</h2>
        {data && (
          <p className={styles.description}>
            {data.phase} · {data.mode}
            {data.paused ? ' · paused' : ''}
            {data.gitManaged ? ' · Git managed' : ''}
          </p>
        )}
      </div>

      {isLoading && <p className={styles.muted}>Loading…</p>}

      {data && (
        <>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {data.ready}/{data.total}
              </div>
              <div className={styles.summaryLabel}>Components ready</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatUsd(data.computeMonthlyUsd)}</div>
              <div className={styles.summaryLabel}>Estimated compute</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {data.requestedCpuMilli === undefined
                  ? '—'
                  : `${(data.requestedCpuMilli / 1000).toFixed(1)} vCPU`}
              </div>
              <div className={styles.summaryLabel}>Requested CPU</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatGiB(data.requestedMemoryBytes)}</div>
              <div className={styles.summaryLabel}>Requested memory</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              title="tabs.run_bootstrap"
              type="outline"
              isLoading={bootstrapping}
              onClick={() => {
                void runBootstrap();
              }}
            />
          </div>
          {bootstrapJob && <p className={styles.muted}>Bootstrap job started: {bootstrapJob}</p>}
          {bootstrapError && <p className={styles.error}>{bootstrapError}</p>}

          <Section
            title="Bundle"
            view={<p>{data.bundle || 'Not set'}</p>}
            editing={bundle.editing}
            onEdit={bundle.start}
            onCancel={bundle.cancel}
            onSave={() => {
              void bundle.commit(bundle.draft);
            }}
            saving={bundle.saving}
            error={bundle.error}
            editor={
              <input
                className={styles.textInput}
                value={bundle.draft as string}
                placeholder="oci://… (empty clears the bundle)"
                onChange={(event) => {
                  bundle.setDraft(event.target.value.trim());
                }}
              />
            }
          />

          <Section
            title="Mode"
            view={<p>{data.mode}</p>}
            editing={mode.editing}
            onEdit={mode.start}
            onCancel={mode.cancel}
            onSave={() => {
              void mode.commit(mode.draft);
            }}
            saving={mode.saving}
            error={mode.error}
            editor={
              <select
                value={mode.draft as string}
                onChange={(event) => {
                  mode.setDraft(event.target.value);
                }}
              >
                {modes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            }
          />

          <Section
            title="Excluded components"
            view={<p>{(data.exclude ?? []).join(', ') || 'None'}</p>}
            editing={exclude.editing}
            onEdit={exclude.start}
            onCancel={exclude.cancel}
            onSave={() => {
              void exclude.commit(
                (exclude.draft as string)
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              );
            }}
            saving={exclude.saving}
            error={exclude.error}
            editor={
              <input
                className={styles.textInput}
                value={exclude.draft as string}
                placeholder="comma, separated, names"
                onChange={(event) => {
                  exclude.setDraft(event.target.value);
                }}
              />
            }
          />

          <Section
            title="Operators"
            view={
              <p>
                {Object.entries(data.operators ?? {})
                  .map(([key, on]) => `${key}: ${on ? 'on' : 'off'}`)
                  .join(' · ') || 'None'}
              </p>
            }
            editing={operators.editing}
            onEdit={operators.start}
            onCancel={operators.cancel}
            onSave={() => {
              void operators.commit(operators.draft);
            }}
            saving={operators.saving}
            error={operators.error}
            editor={
              <div className={styles.checkList}>
                {Object.entries(operators.draft as Record<string, boolean>).map(([key, on]) => (
                  <label key={key} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(event) => {
                        operators.setDraft({
                          ...(operators.draft as Record<string, boolean>),
                          [key]: event.target.checked,
                        });
                      }}
                    />
                    {key}
                  </label>
                ))}
              </div>
            }
          />

          <Section
            title="Feature flags"
            view={<KeyValueView values={data.featureFlags} />}
            editing={flags.editing}
            onEdit={flags.start}
            onCancel={flags.cancel}
            onSave={() => {
              void flags.commit(toMap(flags.draft as Array<{ key: string; value: string }>));
            }}
            saving={flags.saving}
            error={flags.error}
            editor={
              <KeyValueEditor
                rows={flags.draft as Array<{ key: string; value: string }>}
                onChange={(rows) => {
                  flags.setDraft(rows);
                }}
              />
            }
          />

          <Section
            title="Image tags"
            view={<KeyValueView values={data.imageTags} />}
            editing={tags.editing}
            onEdit={tags.start}
            onCancel={tags.cancel}
            onSave={() => {
              void tags.commit(toMap(tags.draft as Array<{ key: string; value: string }>));
            }}
            saving={tags.saving}
            error={tags.error}
            editor={
              <KeyValueEditor
                rows={tags.draft as Array<{ key: string; value: string }>}
                onChange={(rows) => {
                  tags.setDraft(rows);
                }}
              />
            }
          />

          <Section
            title="Helm chart versions"
            view={<KeyValueView values={data.chartVersions} />}
            editing={charts.editing}
            onEdit={charts.start}
            onCancel={charts.cancel}
            onSave={() => {
              void charts.commit(toMap(charts.draft as Array<{ key: string; value: string }>));
            }}
            saving={charts.saving}
            error={charts.error}
            editor={
              <KeyValueEditor
                rows={charts.draft as Array<{ key: string; value: string }>}
                onChange={(rows) => {
                  charts.setDraft(rows);
                }}
              />
            }
          />

          {(data.conditions?.length ?? 0) > 0 && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Conditions</div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.conditions ?? []).map((condition) => (
                    <tr key={condition.type}>
                      <td>{condition.type}</td>
                      <td>{condition.status}</td>
                      <td className={styles.muted}>{condition.reason ?? '—'}</td>
                      <td className={styles.muted}>{condition.message ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardTitle}>Components</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Phase</th>
                  <th>Revision</th>
                  <th>Depends on</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {(data.components ?? []).map((component) => (
                  <tr key={component.name}>
                    <td>{component.name}</td>
                    <td
                      className={
                        (data.failing ?? []).includes(component.name) ? styles.error : undefined
                      }
                    >
                      {component.phase}
                    </td>
                    <td>{component.revision ?? '—'}</td>
                    <td className={styles.muted}>
                      {(component.dependsOn ?? []).join(', ') || '—'}
                    </td>
                    <td className={styles.muted}>{component.message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Stack;
