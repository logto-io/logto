import Tag from '@/components/Tag';

type Props = {
  successCount: number;
  totalCount: number;
  className?: string;
};

function SuccessRate({ successCount, totalCount, className }: Props) {
  if (totalCount === 0) {
    return <div>-</div>;
  }

  const percent = (successCount / totalCount) * 100;
  const statusStyle = percent < 90 ? 'error' : percent < 99 ? 'alert' : 'success';

  return (
    <Tag variant="plain" type="state" status={statusStyle} className={className}>
      {percent.toFixed(2)}%
    </Tag>
  );
}

export default SuccessRate;
