import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
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

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const formatUsd = (value: number | undefined) =>
  value === null || value === undefined ? '—' : currency.format(value);

const formatPercent = (value: number | undefined) =>
  value === null || value === undefined ? '—' : `${Math.round(value)}%`;

const formatGiB = (bytes: number) => `${Math.round(bytes / 1024 ** 3)} GiB`;

const formatVCpu = (milli: number) => `${(milli / 1000).toFixed(1)} vCPU`;

function Kubo() {
  const stacks = useSWR<KuboStack[], RequestError>('api/kubo/stacks');
  const economics = useSWR<KuboClusterEconomics, RequestError>('api/kubo/cluster/economics');
  const demoRequests = useSWR<KuboDemoRequest[], RequestError>('api/kubo/demorequests');

  const counts = useMemo(() => {
    const list = stacks.data ?? [];
    const ready = list.filter((stack) => stack.phase === 'Ready').length;
    return { total: list.length, ready };
  }, [stacks.data]);

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

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{counts.total}</div>
          <div className={styles.summaryLabel}>Workspaces total</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{counts.ready}</div>
          <div className={styles.summaryLabel}>Ready</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Workspaces</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Namespace</th>
              <th>Mode</th>
              <th>Phase</th>
              <th>Components</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {stacks.isLoading && (
              <tr>
                <td colSpan={6}>Loading…</td>
              </tr>
            )}
            {(stacks.data ?? []).map((stack) => (
              <tr key={`${stack.namespace}/${stack.name}`}>
                <td>
                  <Link className={styles.nameLink} to={`stacks/${stack.namespace}/${stack.name}`}>{stack.name}</Link>
                </td>
                <td className={styles.muted}>{stack.namespace}</td>
                <td>{stack.mode}</td>
                <td>{stack.phase}</td>
                <td>
                  {stack.ready}/{stack.total}
                </td>
                <td className={styles.muted}>{stack.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Cluster · estimated monthly capacity budget</div>
        {economics.error && <RequestDataError error={economics.error} />}
        {economics.data && (
          <dl className={styles.budget}>
            <dt>Monthly estimate</dt>
            <dd>
              {economics.data.totalMonthlyUsd === null
                ? `${formatUsd(economics.data.knownMonthlyUsd)}/mo (partial)`
                : `${formatUsd(economics.data.totalMonthlyUsd)}/mo`}
            </dd>
            <dt>Allocation</dt>
            <dd>
              stacks {formatUsd(economics.data.stackMonthlyUsd)} · platform{' '}
              {formatUsd(economics.data.platformMonthlyUsd)} · idle{' '}
              {formatUsd(economics.data.unallocatedMonthlyUsd)}
            </dd>
            <dt>Capacity</dt>
            <dd>
              {economics.data.workerNodes} node(s) · {formatVCpu(economics.data.cpuCapacityMilli)} ·{' '}
              {formatGiB(economics.data.memoryCapacityBytes)}
            </dd>
            <dt>Requested</dt>
            <dd>
              CPU {formatPercent(economics.data.cpuReservedPercent)} · memory{' '}
              {formatPercent(economics.data.memoryReservedPercent)}
            </dd>
          </dl>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Demo requests</div>
        {demoRequests.error && <RequestDataError error={demoRequests.error} />}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Company</th>
              <th>Phase</th>
              <th>Tenant</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {(demoRequests.data ?? []).map((request) => (
              <tr key={request.name}>
                <td>{request.email}</td>
                <td className={styles.muted}>{request.company ?? '—'}</td>
                <td>{request.phase}</td>
                <td>{request.tenant ?? '—'}</td>
                <td className={styles.muted}>
                  {request.expiresAt ? new Date(request.expiresAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Kubo;
