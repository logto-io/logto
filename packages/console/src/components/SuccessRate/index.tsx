import { type HookResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';

type Props = {
  readonly stats?: HookResponse['executionStats'];
  readonly isNumberOnly?: boolean;
};

function SuccessRate({ stats, isNumberOnly }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { successCount, requestCount } = stats ?? { successCount: 0, requestCount: 0 };

  if (requestCount === 0) {
    return <div>-</div>;
  }

  const percent = (successCount / requestCount) * 100;
  const statusStyle = percent < 90 ? 'error' : percent < 99 ? 'alert' : 'success';

  return (
    <Tag variant="plain" type="state" status={statusStyle}>
      {percent.toFixed(2)}%{!isNumberOnly && ` ${t('webhook_details.success_rate')}`}
    </Tag>
  );
}

export default SuccessRate;
