import { Theme } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { type KeyboardEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@/assets/icons/close.svg?react';
import ExternalLinkIcon from '@/assets/icons/external-link.svg?react';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';
import { type ProductUpdateItem, type ProductUpdatesCardStackProps } from './types';
import {
  formatFullPublishedDate,
  formatShortPublishedDate,
  getCardGradientIndex,
  maxVisibleCards,
} from './utils';

export type { ProductUpdateItem, ProductUpdatesCardStackProps } from './types';

const gradientClassNames = [
  styles.gradient0,
  styles.gradient1,
  styles.gradient2,
  styles.gradient3,
] as const;

const layerClassNames = [styles.layer0, styles.layer1, styles.layer2] as const;
const depthClassNames = [styles.depth1, styles.depth2, styles.depth3] as const;

export function ProductUpdatesCardStack({
  items,
  onOpen,
  onDismiss,
  onDismissAll,
  onActiveItemChange,
}: ProductUpdatesCardStackProps) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false);

  const topItem = items[0];

  const activeCardRef = useCallback(
    (element: Nullable<HTMLElement>) => {
      if (element && topItem) {
        onActiveItemChange?.(topItem);
      }
    },
    [onActiveItemChange, topItem]
  );

  const primaryLinkRef = useCallback(
    (element: Nullable<HTMLAnchorElement>) => {
      if (element && shouldRestoreFocus) {
        setShouldRestoreFocus(false);
        element.focus();
      }
    },
    [shouldRestoreFocus]
  );

  if (items.length === 0 || !topItem) {
    return null;
  }

  const visibleItems = items.slice(0, maxVisibleCards);
  const stackedItems = visibleItems.reduceRight<
    Array<{ item: ProductUpdateItem; stackIndex: number }>
  >((accumulator, item, stackIndex) => [...accumulator, { item, stackIndex }], []);
  const totalCount = items.length;
  const depthClassName = depthClassNames[visibleItems.length - 1] ?? styles.depth1;
  const todayLabel = t('general.today');
  const locale = i18n.language || 'en';

  const handleDismiss = (item: ProductUpdateItem, triggerElement: HTMLElement) => {
    if (totalCount > 1 && triggerElement.closest('section')?.contains(document.activeElement)) {
      setShouldRestoreFocus(true);
    }

    onDismiss(item);
  };

  const handleEscapeKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleDismiss(topItem, event.currentTarget);
    }
  };

  return (
    <section
      aria-label={t('product_updates.title')}
      className={classNames(styles.container, theme === Theme.Dark && styles.dark)}
    >
      <div className={classNames(styles.stage, depthClassName)}>
        <div className={styles.cards}>
          {stackedItems.map(({ item, stackIndex }) => {
            const isTop = stackIndex === 0;
            const gradientClassName =
              gradientClassNames[getCardGradientIndex(item.id)] ?? styles.gradient0;
            const layerClassName = layerClassNames[stackIndex] ?? styles.layer2;
            const shortDate = formatShortPublishedDate(item.publishedDate, locale, todayLabel);
            const fullDate = formatFullPublishedDate(item.publishedDate, locale);

            if (!isTop) {
              return (
                <div
                  key={item.id}
                  aria-hidden="true"
                  data-testid="product-update-back-card"
                  className={classNames(styles.card, gradientClassName, layerClassName)}
                >
                  <div className={styles.glowTop} />
                  <div className={styles.glowBottom} />
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardDate}>{shortDate}</span>
                    </div>
                    <div className={styles.cardTitle}>{item.title}</div>
                    <p className={styles.cardSummary}>{item.summary}</p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.readMore}>
                      <span>{t('product_updates.read_more')}</span>
                      <ExternalLinkIcon className={styles.externalLinkIcon} />
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <article
                key={item.id}
                ref={activeCardRef}
                data-testid="product-update-front-card"
                className={classNames(styles.card, gradientClassName, layerClassName)}
              >
                <div aria-hidden="true" className={styles.glowTop} />
                <div aria-hidden="true" className={styles.glowBottom} />
                <a
                  ref={primaryLinkRef}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardLink}
                  onClick={() => {
                    onOpen(item);
                  }}
                  onKeyDown={handleEscapeKeyDown}
                >
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <time
                        className={styles.cardDate}
                        dateTime={item.publishedDate}
                        title={fullDate}
                      >
                        {shortDate}
                      </time>
                    </div>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    <p className={styles.cardSummary}>{item.summary}</p>
                  </div>
                  <div
                    className={classNames(styles.cardFooter, totalCount > 1 && styles.hasClearAll)}
                  >
                    <span className={styles.readMore}>
                      <span>{t('product_updates.read_more')}</span>
                      <ExternalLinkIcon aria-hidden="true" className={styles.externalLinkIcon} />
                    </span>
                  </div>
                </a>
                <button
                  type="button"
                  aria-label={t('product_updates.dismiss')}
                  className={styles.closeButton}
                  onClick={(event) => {
                    handleDismiss(item, event.currentTarget);
                  }}
                  onKeyDown={handleEscapeKeyDown}
                >
                  <CloseIcon aria-hidden="true" className={styles.closeIcon} />
                </button>
                {totalCount > 1 && (
                  <button
                    type="button"
                    className={styles.clearAllButton}
                    onClick={onDismissAll}
                    onKeyDown={handleEscapeKeyDown}
                  >
                    {t('product_updates.clear_all', { count: totalCount })}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductUpdatesCardStack;
