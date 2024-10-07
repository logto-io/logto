import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import FlipOnRtl from '@/ds-components/FlipOnRtl';
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
        <FlipOnRtl>
          <ExternalLinkIcon />
        </FlipOnRtl>
      </IconButton>
    </Tooltip>
  );
}

export default OpenExternalLink;
