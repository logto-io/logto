import { Helmet } from 'react-helmet';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import { type RequestError } from '@/hooks/use-api';

import styles from '../index.module.scss';

type AgentStats = {
  total_requests: number;
  total_sessions: number;
  blocked: number;
  redacted: number;
  input_tokens: number;
  output_tokens: number;
  cost_micro: number;
};

type AgentRequest = {
  id: number;
  keyProduct?: string;
  time: string;
  method: string;
  host: string;
  model?: string;
  status: number;
  action: string;
};

type AgentRequestList = { requests: AgentRequest[]; total: number };

const formatUsd = (micro: number) => `$${(micro / 1_000_000).toFixed(2)}`;

function Agent() {
  const stats = useSWR<AgentStats, RequestError>('api/kubo/agentfw/stats', {
    refreshInterval: 15_000,
  });
  const requests = useSWR<AgentRequestList, RequestError>('api/kubo/agentfw/requests?limit=50', {
    refreshInterval: 15_000,
  });

  if (stats.error) {
    return <RequestDataError error={stats.error} />;
  }

  const summary = stats.data;

  return (
    <div className={styles.container}>
      <Helmet title="MeshX · Agent" />
      <div className={styles.header}>
        <div className={styles.eyebrow}>Infrastructure / Agent</div>
        <h2 className={styles.title}>Agent</h2>
        <p className={styles.description}>
          Requests and sessions across all workspaces, with blocked and redacted traffic.
        </p>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{summary?.total_requests ?? '—'}</div>
          <div className={styles.summaryLabel}>Requests</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{summary?.total_sessions ?? '—'}</div>
          <div className={styles.summaryLabel}>Sessions</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{summary?.blocked ?? '—'}</div>
          <div className={styles.summaryLabel}>Blocked</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{summary?.redacted ?? '—'}</div>
          <div className={styles.summaryLabel}>Redacted</div>
        </div>
        <div className={styles.summaryItem}>
          <div className={styles.summaryValue}>{summary ? formatUsd(summary.cost_micro) : '—'}</div>
          <div className={styles.summaryLabel}>Estimated cost</div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Recent requests</div>
        {requests.error && <RequestDataError error={requests.error} />}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Workspace</th>
              <th>Method</th>
              <th>Host</th>
              <th>Model</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(requests.data?.requests ?? []).map((request) => (
              <tr key={request.id}>
                <td className={styles.muted}>{new Date(request.time).toLocaleString()}</td>
                <td>{request.keyProduct ?? '—'}</td>
                <td>{request.method}</td>
                <td>{request.host}</td>
                <td className={styles.muted}>{request.model ?? '—'}</td>
                <td>{request.status}</td>
                <td>{request.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Agent;
