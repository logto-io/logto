import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { MouseEventHandler } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Copy from '@/assets/icons/copy.svg';
import EyeClosed from '@/assets/icons/eye-closed.svg';
import Eye from '@/assets/icons/eye.svg';
import { onKeyDownHandler } from '@/utils/a11y';

import IconButton from '../IconButton';
import { Tooltip } from '../Tip';

import * as styles from './index.module.scss';

type Props = {
  value: string;
  className?: string;
  variant?: 'text' | 'contained' | 'border' | 'icon';
  hasVisibilityToggle?: boolean;
  size?: 'default' | 'small';
  isWordWrapAllowed?: boolean;
};

type CopyState = TFuncKey<'translation', 'admin_console.general'>;

function CopyToClipboard({
  value,
  className,
  hasVisibilityToggle,
  variant = 'contained',
  size = 'default',
  isWordWrapAllowed = false,
}: Props) {
  const copyIconReference = useRef<HTMLButtonElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('copy');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.general' });
  const [showHiddenContent, setShowHiddenContent] = useState(false);

  const displayValue = useMemo(() => {
    if (!hasVisibilityToggle || showHiddenContent) {
      return value;
    }

    return '•'.repeat(value.length);
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
      className={classNames(styles.container, styles[variant], styles[size], className)}
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
        {variant !== 'icon' && (
          <div className={classNames(styles.content, isWordWrapAllowed && styles.wrapContent)}>
            {displayValue}
          </div>
        )}
        {hasVisibilityToggle && (
          <Tooltip content={t(showHiddenContent ? 'hide' : 'view')}>
            <IconButton
              className={styles.iconButton}
              iconClassName={styles.icon}
              size="small"
              onClick={toggleHiddenContent}
            >
              {showHiddenContent ? <EyeClosed /> : <Eye />}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          isSuccessful={copyState === 'copied'}
          anchorClassName={styles.copyToolTipAnchor}
          content={t(copyState)}
        >
          <IconButton
            ref={copyIconReference}
            className={styles.iconButton}
            iconClassName={styles.icon}
            size="small"
            onClick={copy}
          >
            <Copy />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default CopyToClipboard;
