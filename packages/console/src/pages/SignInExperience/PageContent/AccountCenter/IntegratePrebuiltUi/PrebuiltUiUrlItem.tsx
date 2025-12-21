import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Copy from '@/assets/icons/copy.svg?react';
import Info from '@/assets/icons/info.svg?react';
import TriangleRight from '@/assets/icons/triangle-right.svg?react';
import FlipOnRtl from '@/ds-components/FlipOnRtl';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type CopyState = 'copy' | 'copying' | 'copied';

type Props = {
  readonly path: string;
  readonly tooltip: string;
  readonly tenantEndpoint?: URL;
};

function PrebuiltUiUrlItem({ path, tooltip, tenantEndpoint }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.general' });
  const copyIconRef = useRef<HTMLButtonElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('copy');

  const fullUrl = tenantEndpoint ? new URL(path, tenantEndpoint).toString() : '';

  useEffect(() => {
    copyIconRef.current?.addEventListener('mouseleave', () => {
      setCopyState('copy');
    });
  }, []);

  const handleCopy = async () => {
    copyIconRef.current?.blur();
    setCopyState('copying');
    await navigator.clipboard.writeText(fullUrl);
    setCopyState('copied');
  };

  const handleLivePreview = () => {
    window.open(fullUrl, '_blank');
  };

  return (
    <div className={styles.urlItem}>
      <span className={styles.urlPath}>{path}</span>
      <div className={styles.actions}>
        <Tooltip content={tooltip}>
          <IconButton size="small" className={styles.iconButton}>
            <Info className={styles.icon} />
          </IconButton>
        </Tooltip>
        <Tooltip isSuccessful={copyState === 'copied'} content={t(copyState)}>
          <IconButton
            ref={copyIconRef}
            size="small"
            className={styles.iconButton}
            onClick={handleCopy}
          >
            <Copy className={styles.icon} />
          </IconButton>
        </Tooltip>
        <Tooltip content={t('live_preview')}>
          <IconButton size="small" className={styles.iconButton} onClick={handleLivePreview}>
            <FlipOnRtl>
              <TriangleRight className={styles.icon} />
            </FlipOnRtl>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default PrebuiltUiUrlItem;
