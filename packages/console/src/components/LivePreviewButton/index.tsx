import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@/assets/images/external-link.svg';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import useConfigs from '@/hooks/use-configs';

import * as styles from './index.module.scss';
import type { Props as ButtonProps, ButtonType } from '../Button';
import Button from '../Button';
import { Tooltip } from '../Tip';

type Props = {
  size?: ButtonProps['size'];
  type?: ButtonType;
  isDisabled: boolean;
};

function LivePreviewButton({ size, type, isDisabled }: Props) {
  const { configs, updateConfigs } = useConfigs();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tooltip content={conditional(isDisabled && t('sign_in_exp.preview.live_preview_tip'))}>
      <Button
        size={size}
        type={type}
        disabled={isDisabled}
        title="sign_in_exp.preview.live_preview"
        trailingIcon={
          <ExternalLinkIcon
            className={conditional(
              type !== 'violet' &&
                classNames(styles.defaultIcon, isDisabled && styles.disabledDefaultIcon)
            )}
          />
        }
        onClick={() => {
          if (!configs?.livePreviewChecked) {
            void updateConfigs({ livePreviewChecked: true });
          }

          window.open(new URL('/demo-app', userEndpoint), '_blank');
        }}
      />
    </Tooltip>
  );
}

export default LivePreviewButton;
