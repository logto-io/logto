import classNames from 'classnames';
import type { MouseEventHandler } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';

import Copy from '@/assets/images/copy.svg';
import EyeClosed from '@/assets/images/eye-closed.svg';
import Eye from '@/assets/images/eye.svg';
import { onKeyDownHandler } from '@/utilities/a11y';

import IconButton from '../IconButton';
import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

type Props = {
  value: string;
  className?: string;
  variant?: 'text' | 'contained' | 'border' | 'icon';
  hasVisibilityToggle?: boolean;
};

type CopyState = TFuncKey<'translation', 'admin_console.general'>;

const CopyToClipboard = ({
  value,
  className,
  hasVisibilityToggle,
  variant = 'contained',
}: Props) => {
  const copyIconReference = useRef<HTMLButtonElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('copy');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.general' });
  const [showHiddenContent, setShowHiddenContent] = useState(false);

  const displayValue = useMemo(() => {
    if (!hasVisibilityToggle || showHiddenContent) {
      return value;
    }

    return '*'.repeat(value.length);
  }, [hasVisibilityToggle, showHiddenContent, value]);

  useEffect(() => {
    copyIconReference.current?.addEventListener('mouseleave', () => {
      setCopyState('copy');
    });
  }, []);

  const copy: MouseEventHandler<HTMLButtonElement> = async () => {
    setCopyState('copying');
    await navigator.clipboard.writeText(value);
    setCopyState('copied');
  };

  const toggleHiddenContent = () => {
    setShowHiddenContent((previous) => !previous);
  };

  return (
    <div
      className={classNames(styles.container, styles[variant], className)}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDownHandler((event) => {
        event.stopPropagation();
      })}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className={styles.row}>
        {variant !== 'icon' && <div className={styles.content}>{displayValue}</div>}
        {hasVisibilityToggle && (
          <div className={styles.eye}>
            <IconButton onClick={toggleHiddenContent}>
              {showHiddenContent ? <EyeClosed /> : <Eye />}
            </IconButton>
          </div>
        )}
        <IconButton
          ref={copyIconReference}
          className={styles.copyIconButton}
          iconClassName={styles.copyIcon}
          onClick={copy}
        >
          <Copy />
        </IconButton>
        <Tooltip
          anchorRef={copyIconReference}
          content={t(copyState)}
          horizontalAlign="center"
          className={classNames(copyState === 'copied' && styles.successfulTooltip)}
        />
      </div>
    </div>
  );
};

export default CopyToClipboard;
