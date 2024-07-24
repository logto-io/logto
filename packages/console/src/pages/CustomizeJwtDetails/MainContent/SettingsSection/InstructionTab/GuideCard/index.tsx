import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CaretExpandedIcon from '@/assets/icons/caret-expanded.svg?react';
import Card from '@/ds-components/Card';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

export enum CardType {
  UserData = 'user_data',
  GrantData = 'grant_data',
  TokenData = 'token_data',
  FetchExternalData = 'fetch_external_data',
  EnvironmentVariables = 'environment_variables',
}

type GuardCardProps = {
  readonly name: CardType;
  readonly children?: React.ReactNode;
  readonly isExpanded: boolean;
  readonly setExpanded: (expanded: boolean) => void;
};

function GuideCard({ name, children, isExpanded, setExpanded }: GuardCardProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.jwt_claims' });

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
      <div className={styles.cardContent}>{children}</div>
    </Card>
  );
}

export default GuideCard;
