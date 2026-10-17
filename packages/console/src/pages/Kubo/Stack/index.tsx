import { type AdminConsoleKey } from '@logto/phrases';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import Checkbox from '@/ds-components/Checkbox';
import Select from '@/ds-components/Select';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import TextInput from '@/ds-components/TextInput';
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
  failing?: string[] | undefined;
  paused?: boolean;
  computeMonthlyUsd?: number;
  requestedCpuMilli?: number;
  requestedMemoryBytes?: number;
  bundle?: string;
  gitManaged?: boolean;
  exclude?: string[] | undefined;
  operators?: Record<string, boolean> | undefined;
  featureFlags?: Record<string, string> | undefined;
  imageTags?: Record<string, string> | undefined;
  chartVersions?: Record<string, string> | undefined;
  conditions?: KuboCondition[] | undefined;
  components?: KuboComponent[] | undefined;
};

type KeyValueRow = { key: string; value: string };

const modes = ['Direct', 'Flux'];

const formatUsd = (value?: number) => (value === undefined ? '—' : `$${value.toFixed(2)}/mo`);
const formatGiB = (bytes?: number) =>
  bytes === undefined ? '—' : `${(bytes / 1024 ** 3).toFixed(1)} GiB`;

const toRows = (values?: Record<string, string> | undefined): KeyValueRow[] =>
  Object.entries(values ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, value }));

const toMap = (rows: KeyValueRow[]) =>
  Object.fromEntries(
    rows.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])
  );

// One card per setting. Each card saves only its own field.
function Section({
  title,
  editing,
  onEdit,
  onCancel,
  onSave,
  saving,
  error,
  view,
  editor,
}: {
  readonly title: AdminConsoleKey;
  readonly editing: boolean;
  readonly onEdit: () => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
  readonly saving: boolean;
  readonly error?: string;
  readonly view: React.ReactNode;
  readonly editor: React.ReactNode;
}) {
  return (
    <Card className={styles.section}>
      <div className={styles.sectionHeader}>
        <CardTitle title={title} />
        {!editing && <Button title="general.edit" type="outline" size="small" onClick={onEdit} />}
      </div>
      {editing ? editor : view}
      {error && <p className={styles.error}>{error}</p>}
      {editing && (
        <div className={styles.actions}>
          <Button title="general.cancel" type="outline" onClick={onCancel} />
          <Button title="general.save" type="primary" isLoading={saving} onClick={onSave} />
        </div>
      )}
    </Card>
  );
}

// Editable name → value rows. The portal replaces the whole map on save.
function KeyValueEditor({
  rows,
  onChange,
}: {
  readonly rows: KeyValueRow[];
  readonly onChange: (rows: KeyValueRow[]) => void;
}) {
  return (
    <div className={styles.kvEditor}>
      {rows.map((row, index) => (
        <div key={index} className={styles.kvRow}>
          <TextInput
            value={row.key}
            placeholder="Name"
            onChange={(event) => {
              onChange(
                rows.map((r, i) =>
                  i === index ? { ...r, key: (event.target as HTMLInputElement).value } : r
                )
              );
            }}
          />
          <TextInput
            value={row.value}
            placeholder="Value"
            onChange={(event) => {
              onChange(
                rows.map((r, i) =>
                  i === index ? { ...r, value: (event.target as HTMLInputElement).value } : r
                )
              );
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
}

function KeyValueTable({ rows }: { readonly rows: KeyValueRow[] }) {
  return (
    <Table
      rowGroups={[{ key: 'values', data: rows }]}
      rowIndexKey="key"
      columns={[
        { title: 'Name', dataIndex: 'key', render: (row: KeyValueRow) => row.key },
        { title: 'Value', dataIndex: 'value', render: (row: KeyValueRow) => row.value || '—' },
      ]}
      placeholder="None set"
    />
  );
}

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

  // Per-section edit state, kept in one place so the cards stay independent.
  const [editing, setEditing] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [sectionError, setSectionError] = useState<Record<string, string | undefined>>({});
  const [draft, setDraft] = useState<unknown>();

  const start = (field: string, initial: unknown) => {
    setEditing(field);
    setDraft(initial);
    setSectionError((previous) => ({ ...previous, [field]: undefined }));
  };

  const cancel = () => {
    setEditing(undefined);
  };

  const commit = async (field: string, value: unknown) => {
    setSaving(true);
    setSectionError((previous) => ({ ...previous, [field]: undefined }));
    try {
      await patch({ [field]: value });
      setEditing(undefined);
    } catch (error_: unknown) {
      setSectionError((previous) => ({
        ...previous,
        [field]: error_ instanceof Error ? error_.message : 'Save failed',
      }));
    } finally {
      setSaving(false);
    }
  };

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

  const isEditing = (field: string) => editing === field;
  const sectionProps = (
    field: string,
    title: AdminConsoleKey,
    view: React.ReactNode,
    editor: React.ReactNode,
    initial: unknown,
    value: () => unknown
  ) => ({
    title,
    editing: isEditing(field),
    onEdit: () => {
      start(field, initial);
    },
    onCancel: cancel,
    onSave: () => {
      void commit(field, value());
    },
    saving,
    error: sectionError[field],
    view,
    editor,
  });

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
            <Card className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {data.ready}/{data.total}
              </div>
              <div className={styles.summaryLabel}>Components ready</div>
            </Card>
            <Card className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatUsd(data.computeMonthlyUsd)}</div>
              <div className={styles.summaryLabel}>Estimated compute</div>
            </Card>
            <Card className={styles.summaryItem}>
              <div className={styles.summaryValue}>
                {data.requestedCpuMilli === undefined
                  ? '—'
                  : `${(data.requestedCpuMilli / 1000).toFixed(1)} vCPU`}
              </div>
              <div className={styles.summaryLabel}>Requested CPU</div>
            </Card>
            <Card className={styles.summaryItem}>
              <div className={styles.summaryValue}>{formatGiB(data.requestedMemoryBytes)}</div>
              <div className={styles.summaryLabel}>Requested memory</div>
            </Card>
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
            {...sectionProps(
              'bundle',
              'infrastructure.bundle',
              <p>{data.bundle || 'Not set'}</p>,
              <TextInput
                value={(draft as string) ?? ''}
                placeholder="oci://… (empty clears the bundle)"
                onChange={(event) => {
                  setDraft((event.target as HTMLInputElement).value.trim());
                }}
              />,
              data.bundle ?? '',
              () => (draft as string) || ''
            )}
          />

          <Section
            {...sectionProps(
              'mode',
              'infrastructure.mode',
              <p>{data.mode}</p>,
              <Select
                value={(draft as string) ?? data.mode}
                options={modes.map((mode) => ({ value: mode, title: mode }))}
                onChange={(value) => {
                  setDraft(value);
                }}
              />,
              data.mode,
              () => (draft as string) ?? data.mode
            )}
          />

          <Section
            {...sectionProps(
              'exclude',
              'infrastructure.excluded_components',
              <p>{(data.exclude ?? []).join(', ') || 'None'}</p>,
              <TextInput
                value={(draft as string) ?? ''}
                placeholder="comma, separated, names"
                onChange={(event) => {
                  setDraft((event.target as HTMLInputElement).value);
                }}
              />,
              (data.exclude ?? []).join(', '),
              () =>
                ((draft as string) ?? '')
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
            )}
          />

          <Section
            {...sectionProps(
              'operators',
              'infrastructure.operators',
              <p>
                {Object.entries(data.operators ?? {})
                  .map(([key, on]) => `${key}: ${on ? 'on' : 'off'}`)
                  .join(' · ') || 'None'}
              </p>,
              <div className={styles.checkList}>
                {Object.entries((draft as Record<string, boolean>) ?? {}).map(([key, on]) => (
                  <Checkbox
                    key={key}
                    label={key}
                    checked={on}
                    onChange={(checked) => {
                      setDraft({ ...(draft as Record<string, boolean>), [key]: checked });
                    }}
                  />
                ))}
              </div>,
              { ...data.operators },
              () => (draft as Record<string, boolean>) ?? {}
            )}
          />

          <Section
            {...sectionProps(
              'featureFlags',
              'infrastructure.feature_flags',
              <KeyValueTable rows={toRows(data.featureFlags)} />,
              <KeyValueEditor
                rows={(draft as KeyValueRow[]) ?? []}
                onChange={(rows) => {
                  setDraft(rows);
                }}
              />,
              toRows(data.featureFlags),
              () => toMap((draft as KeyValueRow[]) ?? [])
            )}
          />

          <Section
            {...sectionProps(
              'imageTags',
              'infrastructure.image_tags',
              <KeyValueTable rows={toRows(data.imageTags)} />,
              <KeyValueEditor
                rows={(draft as KeyValueRow[]) ?? []}
                onChange={(rows) => {
                  setDraft(rows);
                }}
              />,
              toRows(data.imageTags),
              () => toMap((draft as KeyValueRow[]) ?? [])
            )}
          />

          <Section
            {...sectionProps(
              'chartVersions',
              'infrastructure.helm_chart_versions',
              <KeyValueTable rows={toRows(data.chartVersions)} />,
              <KeyValueEditor
                rows={(draft as KeyValueRow[]) ?? []}
                onChange={(rows) => {
                  setDraft(rows);
                }}
              />,
              toRows(data.chartVersions),
              () => toMap((draft as KeyValueRow[]) ?? [])
            )}
          />

          {(data.conditions?.length ?? 0) > 0 && (
            <Card className={styles.section}>
              <CardTitle title="infrastructure.conditions" />
              <Table
                rowGroups={[{ key: 'conditions', data: data.conditions ?? [] }]}
                rowIndexKey="type"
                columns={[
                  { title: 'Type', dataIndex: 'type', render: (row: KuboCondition) => row.type },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (row: KuboCondition) => row.status,
                  },
                  {
                    title: 'Reason',
                    dataIndex: 'reason',
                    render: (row: KuboCondition) => row.reason ?? '—',
                  },
                  {
                    title: 'Message',
                    dataIndex: 'message',
                    render: (row: KuboCondition) => row.message ?? '—',
                  },
                ]}
              />
            </Card>
          )}

          <Card className={styles.section}>
            <CardTitle title="infrastructure.components" />
            <Table
              rowGroups={[{ key: 'components', data: data.components ?? [] }]}
              rowIndexKey="name"
              columns={[
                { title: 'Component', dataIndex: 'name', render: (row: KuboComponent) => row.name },
                {
                  title: 'Phase',
                  dataIndex: 'phase',
                  render: (row: KuboComponent) =>
                    (data.failing ?? []).includes(row.name) ? (
                      <Tag status="error">{row.phase}</Tag>
                    ) : (
                      row.phase
                    ),
                },
                {
                  title: 'Revision',
                  dataIndex: 'revision',
                  render: (row: KuboComponent) => row.revision ?? '—',
                },
                {
                  title: 'Depends on',
                  dataIndex: 'dependsOn',
                  render: (row: KuboComponent) => (row.dependsOn ?? []).join(', ') || '—',
                },
                {
                  title: 'Message',
                  dataIndex: 'message',
                  render: (row: KuboComponent) => row.message ?? '—',
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default Stack;
