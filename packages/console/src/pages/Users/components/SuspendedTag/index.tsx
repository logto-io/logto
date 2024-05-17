import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';

type Props = {
  readonly className?: string;
};

function SuspendedTag({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tag status="error" className={className}>
      {t('user_details.suspended')}
    </Tag>
  );
}

export default SuspendedTag;
