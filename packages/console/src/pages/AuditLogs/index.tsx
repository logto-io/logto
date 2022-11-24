import AuditLogTable from '@/components/AuditLogTable';
import CardTitle from '@/components/CardTitle';
import PageLayout, { Content, HeadLine } from '@/components/PageLayout';

const AuditLogs = () => {
  return (
    <PageLayout>
      <HeadLine>
        <CardTitle title="logs.title" subtitle="logs.subtitle" />
      </HeadLine>
      <Content>
        <AuditLogTable />
      </Content>
    </PageLayout>
  );
};

export default AuditLogs;
