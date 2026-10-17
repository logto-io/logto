import { Helmet } from 'react-helmet';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import Card from '@/ds-components/Card';
import CardTitle from '@/ds-components/CardTitle';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
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

const Metric = ({ value, label }: { value: string | number; label: string }) => (
  <Card className={styles.metric}>
    <div className={styles.summaryValue}>{value}</div>
    <div className={styles.summaryLabel}>{label}</div>
  </Card>
);

const Agent = () => {
  const stats = useSWR<AgentStats, RequestError>('api/kubo/agentfw/stats', { refreshInterval: 15_000 });
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
        <h2 className={styles.title}>
          <DynamicT forKey="infrastructure.agent_title" />
        </h2>
        <p className={styles.description}>
          <DynamicT forKey="infrastructure.agent_description" />
        </p>
      </div>

      <div className={styles.summary}>
        <Metric value={summary?.total_requests ?? '—'} label="Requests" />
        <Metric value={summary?.total_sessions ?? '—'} label="Sessions" />
        <Metric value={summary?.blocked ?? '—'} label="Blocked" />
        <Metric value={summary?.redacted ?? '—'} label="Redacted" />
        <Metric value={summary ? formatUsd(summary.cost_micro) : '—'} label="Estimated cost" />
      </div>

      <Card className={styles.section}>
        <CardTitle title="infrastructure.recent_requests" />
        {requests.error && <RequestDataError error={requests.error} />}
        <Table
          rowGroups={[{ key: 'requests', data: requests.data?.requests ?? [] }]}
          rowIndexKey="id"
          columns={[
            {
              title: <DynamicT forKey="infrastructure.column.time" />,
              dataIndex: 'time',
              render: (row: AgentRequest) => new Date(row.time).toLocaleString(),
            },
            {
              title: <DynamicT forKey="infrastructure.column.workspace" />,
              dataIndex: 'keyProduct',
              render: (row: AgentRequest) => row.keyProduct ?? '—',
            },
            {
              title: <DynamicT forKey="infrastructure.column.method" />,
              dataIndex: 'method',
              render: (row: AgentRequest) => row.method,
            },
            {
              title: <DynamicT forKey="infrastructure.column.host" />,
              dataIndex: 'host',
              render: (row: AgentRequest) => row.host,
            },
            {
              title: <DynamicT forKey="infrastructure.column.model" />,
              dataIndex: 'model',
              render: (row: AgentRequest) => row.model ?? '—',
            },
            {
              title: <DynamicT forKey="infrastructure.column.status" />,
              dataIndex: 'status',
              render: (row: AgentRequest) => <Tag status={row.status < 400 ? 'success' : 'error'}>{row.status}</Tag>,
            },
            {
              title: <DynamicT forKey="infrastructure.column.action" />,
              dataIndex: 'action',
              render: (row: AgentRequest) => row.action,
            },
          ]}
          placeholder={<DynamicT forKey="infrastructure.no_requests" />}
        />
      </Card>
    </div>
  );
};

export default Agent;
