import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';

type Props = {
  readonly link: string;
};

function OpenExternalLink({ link }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <Tooltip content={t('general.open')}>
      <IconButton
        size="small"
        onClick={() => {
          window.open(link, '_blank');
        }}
      >
        <ExternalLinkIcon />
      </IconButton>
    </Tooltip>
  );
}

export default OpenExternalLink;
