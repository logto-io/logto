import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';

type KuboStack = {
  namespace: string;
  name: string;
  mode: string;
  phase: string;
  ready: number;
  total: number;
  age: string;
  failureMsg?: string;
};

type KuboClusterEconomics = {
  workerNodes: number;
  totalMonthlyUsd: number | undefined;
  knownMonthlyUsd: number;
  stackMonthlyUsd: number;
  platformMonthlyUsd: number;
  unallocatedMonthlyUsd: number;
  cpuCapacityMilli: number;
  memoryCapacityBytes: number;
  cpuReservedPercent: number | undefined;
  memoryReservedPercent: number | undefined;
};

type KuboDemoRequest = {
  name: string;
  email: string;
  company?: string;
  phase: string;
  tenant?: string;
  expiresAt?: string;
  age: string;
};

type BudgetRow = { key: string; label: string; value: string };

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const formatUsd = (value: number | undefined) =>
  value === undefined ? '—' : currency.format(value);

const formatPercent = (value: number | undefined) =>
  value === undefined ? '—' : `${Math.round(value)}%`;

const formatGiB = (bytes: number) => `${Math.round(bytes / 1024 ** 3)} GiB`;

const formatVCpu = (milli: number) => `${(milli / 1000).toFixed(1)} vCPU`;

// A metric card: a large value with a small label, on the shared Card.
function Metric({ value, label }: { readonly value: string | number; readonly label: string }) {
  return (
    <Card className={styles.metric}>
      <div className={styles.summaryValue}>{value}</div>
      <div className={styles.summaryLabel}>{label}</div>
    </Card>
  );
}

// Phases in the order the filter bar shows them.
const phaseOrder = [
  'Ready',
  'Progressing',
  'Failed',
  'Pending',
  'Degraded',
  'Paused',
  'Terminating',
];

function Kubo() {
  const stacks = useSWR<KuboStack[], RequestError>('api/kubo/stacks');
  const economics = useSWR<KuboClusterEconomics, RequestError>('api/kubo/cluster/economics');
  const demoRequests = useSWR<KuboDemoRequest[], RequestError>('api/kubo/demorequests');
  const [phaseFilter, setPhaseFilter] = useState<string>();
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const list = stacks.data ?? [];
    const byPhase = Object.fromEntries(
      phaseOrder.map((phase) => [phase, list.filter((stack) => stack.phase === phase).length])
    );
    return { total: list.length, byPhase };
  }, [stacks.data]);

  const visibleStacks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (stacks.data ?? []).filter(
      (stack) =>
        (!phaseFilter || stack.phase === phaseFilter) &&
        (!needle ||
          stack.name.toLowerCase().includes(needle) ||
          stack.namespace.toLowerCase().includes(needle))
    );
  }, [stacks.data, phaseFilter, query]);

  const budgetRows = useMemo((): BudgetRow[] => {
    const { data } = economics;
    if (!data) {
      return [];
    }
    return [
      {
        key: 'monthly',
        label: 'Monthly estimate',
        value: `${formatUsd(data.totalMonthlyUsd ?? data.knownMonthlyUsd)}/mo${data.totalMonthlyUsd === undefined ? ' (partial)' : ''}`,
      },
      {
        key: 'allocation',
        label: 'Allocation',
        value: `workspaces ${formatUsd(data.stackMonthlyUsd)} · platform ${formatUsd(data.platformMonthlyUsd)} · idle ${formatUsd(data.unallocatedMonthlyUsd)}`,
      },
      {
        key: 'capacity',
        label: 'Capacity',
        value: `${data.workerNodes} node(s) · ${formatVCpu(data.cpuCapacityMilli)} · ${formatGiB(data.memoryCapacityBytes)}`,
      },
      {
        key: 'requested',
        label: 'Requested',
        value: `CPU ${formatPercent(data.cpuReservedPercent)} · memory ${formatPercent(data.memoryReservedPercent)}`,
      },
    ];
  }, [economics.data]);

  if (stacks.error) {
    return <RequestDataError error={stacks.error} />;
  }

  return (
    <div className={styles.container}>
      <Helmet title="MeshX Workspaces" />
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / Overview</div>
        <h2 className={styles.title}>Workspaces</h2>
        <p className={styles.description}>
          Deployment health, components, and operations across your namespaces.
        </p>
      </div>

      <Card className={styles.overview}>
        <div className={styles.overviewTotal}>
          <div className={styles.summaryValue}>{counts.total}</div>
          <div className={styles.summaryLabel}>workspaces total</div>
        </div>
        <div className={styles.phaseFilters}>
          {phaseOrder.map((phase) => (
            <button
              key={phase}
              type="button"
              aria-pressed={phaseFilter === phase}
              className={classNames(
                styles.phaseFilter,
                phaseFilter === phase && styles.phaseActive
              )}
              onClick={() => {
                setPhaseFilter((current) => (current === phase ? undefined : phase));
              }}
            >
              <span className={styles.dot} data-phase={phase} />
              {phase}
              <span className={styles.phaseCount}>{counts.byPhase[phase] ?? 0}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className={styles.section}>
        <CardTitle title="infrastructure.workspaces" />
        <input
          className={styles.search}
          type="search"
          placeholder="Search namespace or name…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <Table
          rowGroups={[{ key: 'workspaces', data: visibleStacks }]}
          rowIndexKey="name"
          columns={[
            {
              title: <DynamicT forKey="infrastructure.column.name" />,
              dataIndex: 'name',
              render: (row: KuboStack) => (
                <Link className={styles.nameLink} to={`stacks/${row.namespace}/${row.name}`}>
                  {row.name}
                </Link>
              ),
            },
            {
              title: <DynamicT forKey="infrastructure.column.namespace" />,
              dataIndex: 'namespace',
              render: (row: KuboStack) => row.namespace,
            },
            {
              title: <DynamicT forKey="infrastructure.column.mode" />,
              dataIndex: 'mode',
              render: (row: KuboStack) => row.mode,
            },
            {
              title: <DynamicT forKey="infrastructure.column.phase" />,
              dataIndex: 'phase',
              render: (row: KuboStack) => (
                <>
                  <Tag status={row.phase === 'Ready' ? 'success' : 'error'}>{row.phase}</Tag>
                  {row.failureMsg && <p className={styles.failure}>{row.failureMsg}</p>}
                </>
              ),
            },
            {
              title: <DynamicT forKey="infrastructure.column.components" />,
              dataIndex: 'ready',
              render: (row: KuboStack) => {
                const percent = row.total > 0 ? Math.round((row.ready / row.total) * 100) : 0;
                return (
                  <span className={styles.components}>
                    <span className={styles.componentProgress}>
                      <i style={{ width: `${percent}%` }} data-complete={row.ready === row.total} />
                    </span>
                    {row.ready}/{row.total}
                  </span>
                );
              },
            },
            {
              title: <DynamicT forKey="infrastructure.column.age" />,
              dataIndex: 'age',
              render: (row: KuboStack) => row.age,
            },
          ]}
          placeholder={<DynamicT forKey="infrastructure.workspaces_empty" />}
        />
      </Card>

      <Card className={styles.section}>
        <CardTitle title="infrastructure.cluster_budget" />
        {economics.error && <RequestDataError error={economics.error} />}
        <Table
          rowGroups={[{ key: 'budget', data: budgetRows }]}
          rowIndexKey="key"
          columns={[
            {
              title: <DynamicT forKey="infrastructure.column.label" />,
              dataIndex: 'label',
              render: (row: BudgetRow) => row.label,
            },
            {
              title: <DynamicT forKey="infrastructure.column.value" />,
              dataIndex: 'value',
              render: (row: BudgetRow) => row.value,
            },
          ]}
        />
      </Card>

      <Card className={styles.section}>
        <CardTitle title="infrastructure.demo_requests" />
        {demoRequests.error && <RequestDataError error={demoRequests.error} />}
        <Table
          rowGroups={[{ key: 'demo', data: demoRequests.data ?? [] }]}
          rowIndexKey="name"
          columns={[
            {
              title: <DynamicT forKey="infrastructure.column.email" />,
              dataIndex: 'email',
              render: (row: KuboDemoRequest) => row.email,
            },
            {
              title: <DynamicT forKey="infrastructure.column.company" />,
              dataIndex: 'company',
              render: (row: KuboDemoRequest) => row.company ?? '—',
            },
            {
              title: <DynamicT forKey="infrastructure.column.phase" />,
              dataIndex: 'phase',
              render: (row: KuboDemoRequest) => row.phase,
            },
            {
              title: <DynamicT forKey="infrastructure.column.tenant" />,
              dataIndex: 'tenant',
              render: (row: KuboDemoRequest) => row.tenant ?? '—',
            },
            {
              title: <DynamicT forKey="infrastructure.column.expires" />,
              dataIndex: 'expiresAt',
              render: (row: KuboDemoRequest) =>
                row.expiresAt ? new Date(row.expiresAt).toLocaleString() : '—',
            },
          ]}
          placeholder={<DynamicT forKey="infrastructure.no_demo_requests" />}
        />
      </Card>
    </div>
  );
}

export default Kubo;
