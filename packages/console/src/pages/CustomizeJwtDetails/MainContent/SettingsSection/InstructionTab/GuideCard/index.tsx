import classNames from 'classnames';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CaretExpandedIcon from '@/assets/icons/caret-expanded.svg?react';
import Card from '@/ds-components/Card';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export enum CardType {
  UserData = 'user_data',
  GrantData = 'grant_data',
  InteractionData = 'interaction_data',
  ApplicationData = 'application_data',
  TokenData = 'token_data',
  FetchExternalData = 'fetch_external_data',
  EnvironmentVariables = 'environment_variables',
  ApiContext = 'api_context',
  ErrorHandling = 'error_handling',
}

type GuardCardProps = {
  readonly name: CardType;
  readonly children?: React.ReactNode;
  readonly isExpanded: boolean;
  readonly setExpanded: (expanded: boolean) => void;
};

function GuideCard({ name, children, isExpanded, setExpanded }: GuardCardProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });
  const contentReference = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const collapseAnimationFrame = useRef<number>();
  const [contentHeight, setContentHeight] = useState<number | 'auto'>(isExpanded ? 'auto' : 0);
  const [contentOverflow, setContentOverflow] = useState<'hidden' | 'visible'>(
    isExpanded ? 'visible' : 'hidden'
  );

  useEffect(
    () => () => {
      if (collapseAnimationFrame.current) {
        cancelAnimationFrame(collapseAnimationFrame.current);
      }
    },
    []
  );

  useLayoutEffect(() => {
    const content = contentReference.current;

    if (!content) {
      return;
    }

    if (!hasMounted.current) {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- A ref lets us skip the first paint without adding extra render-only state.
      hasMounted.current = true;
      return;
    }

    if (collapseAnimationFrame.current) {
      cancelAnimationFrame(collapseAnimationFrame.current);
    }

    // Animate against the element's real height so the card and the content below it
    // move together. The previous `max-height` + `overflow: visible` approach could
    // reveal tall content before the layout below had fully caught up.
    if (isExpanded) {
      setContentOverflow('hidden');
      setContentHeight(content.scrollHeight);
      return;
    }

    // When collapsing from `auto`, first freeze the current height and then step down
    // to `0px` on the next frame. That gives the browser two concrete values to tween
    // between instead of snapping shut.
    setContentOverflow('hidden');
    setContentHeight(content.scrollHeight);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- We keep the frame id in a ref so the cleanup can cancel only the scheduled collapse step.
    collapseAnimationFrame.current = requestAnimationFrame(() => {
      setContentHeight(0);
    });
  }, [isExpanded]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (isExpanded) {
      // Switch back to `auto` after the expand animation so late content changes
      // (for example localization or dynamic form state) can keep the card natural.
      setContentHeight('auto');
      setContentOverflow('visible');
      return;
    }

    setContentOverflow('hidden');
  };

  return (
    <Card className={classNames(styles.card, isExpanded && styles.expanded)}>
      <div
        className={styles.headerRow}
        role="button"
        tabIndex={0}
        onClick={() => {
          setExpanded(!isExpanded);
        }}
        onKeyDown={onKeyDownHandler(() => {
          setExpanded(!isExpanded);
        })}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>{t(`${name}.title`)}</div>
          <div className={styles.cardSubtitle}>{t(`${name}.subtitle`)}</div>
        </div>
        <CaretExpandedIcon className={styles.expandButton} />
      </div>
      <div
        ref={contentReference}
        className={styles.cardContent}
        style={{
          height: typeof contentHeight === 'number' ? `${contentHeight}px` : 'auto',
          overflow: contentOverflow,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
    </Card>
  );
}

export default GuideCard;
