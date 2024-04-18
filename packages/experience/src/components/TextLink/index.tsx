import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useMemo } from 'react';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useIframeModal } from '@/Providers/IframeModalProvider';
import usePlatform from '@/hooks/use-platform';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly text?: TFuncKey;
  readonly icon?: ReactNode;
  readonly type?: 'primary' | 'secondary';
} & Partial<LinkProps>;

const TextLink = ({ className, children, text, icon, type = 'primary', to, ...rest }: Props) => {
  const { t } = useTranslation();
  const { isMobile } = usePlatform();
  const { setModalState } = useIframeModal();

  // By default the behavior of opening a new window is not supported in WkWebView, or in android webview.
  // Hijack the hyperlink props and open the link in an iframe modal instead.
  const hyperLinkProps = useMemo(() => {
    const { href, target, onClick, ...others } = rest;

    // Keep the original behavior if the link is not external.
    if (!href || target !== '_blank') {
      return rest;
    }

    return {
      href,
      target,
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isMobile) {
          const title = text && t(text);
          event.preventDefault();
          setModalState({ href, title: typeof title === 'string' ? title : undefined });
        }

        onClick?.(event);
      },
      ...others,
    };
  }, [isMobile, rest, setModalState, t, text]);

  if (to) {
    return (
      <Link className={classNames(styles.link, styles[type], className)} to={to} {...rest}>
        {icon}
        {children ?? <DynamicT forKey={text} />}
      </Link>
    );
  }

  return (
    <a
      className={classNames(styles.link, styles[type], className)}
      {...hyperLinkProps}
      rel="noopener"
    >
      {icon}
      {children ?? <DynamicT forKey={text} />}
    </a>
  );
};

export default TextLink;
