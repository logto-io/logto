import classNames from 'classnames';
import React, { forwardRef, MouseEventHandler, SVGProps, useEffect, useRef, useState } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';

import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

type Props = {
  value: string;
  className?: string;
  variant?: 'text' | 'contained' | 'border';
};

const CopyIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props: SVGProps<SVGSVGElement>, reference) => (
    <svg
      ref={reference}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.6667 18.3332H3.33335C2.88675 18.3487 2.45375 18.1781 2.13776 17.8621C1.82177 17.5461 1.65116 17.1131 1.66668 16.6665V8.33317C1.65116 7.88656 1.82177 7.45356 2.13776 7.13758C2.45375 6.82159 2.88675 6.65098 3.33335 6.6665H6.66668V3.33317C6.65117 2.88656 6.82177 2.45356 7.13776 2.13757C7.45375 1.82159 7.88675 1.65098 8.33335 1.6665H16.6667C17.1133 1.65098 17.5463 1.82159 17.8623 2.13757C18.1783 2.45356 18.3489 2.88656 18.3334 3.33317V11.6665C18.3486 12.113 18.1779 12.5459 17.862 12.8618C17.5461 13.1778 17.1132 13.3484 16.6667 13.3332H13.3334V16.6665C13.3486 17.113 13.1779 17.5459 12.862 17.8618C12.5461 18.1778 12.1132 18.3484 11.6667 18.3332ZM3.33335 8.33317V16.6665H11.6667V13.3332H8.33335C7.88682 13.3484 7.45396 13.1778 7.13803 12.8618C6.8221 12.5459 6.65141 12.113 6.66668 11.6665V8.33317H3.33335ZM8.33335 3.33317V11.6665H16.6667V3.33317H8.33335Z" />
    </svg>
  )
);

type CopyState = TFuncKey<'translation', 'admin_console.copy'>;

const CopyToClipboard = ({ value, className, variant = 'contained' }: Props) => {
  const copyIconReference = useRef<SVGSVGElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('pending');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.copy' });

  useEffect(() => {
    copyIconReference.current?.addEventListener('mouseleave', () => {
      setCopyState('pending');
    });
  }, []);

  const copy: MouseEventHandler<SVGSVGElement> = async () => {
    setCopyState('copying');
    await navigator.clipboard.writeText(value);
    setCopyState('copied');
  };

  return (
    <div
      className={classNames(styles.container, styles[variant], className)}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className={styles.row}>
        {value}
        <CopyIcon ref={copyIconReference} onClick={copy} />
        <Tooltip
          className={classNames(copyState === 'copied' && styles.successTooltip)}
          domRef={copyIconReference}
          content={t(copyState)}
        />
      </div>
    </div>
  );
};

export default CopyToClipboard;
