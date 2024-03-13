import { LogtoJwtTokenPath } from '@logto/schemas';
import classNames from 'classnames';

import Card from '@/ds-components/Card';

import * as pageLayoutStyles from '../index.module.scss';

import * as styles from './index.module.scss';

type Props = {
  tokenType: LogtoJwtTokenPath;
};

function PageLoadingSkeleton({ tokenType }: Props) {
  return (
    <div className={pageLayoutStyles.tabContent}>
      <Card className={pageLayoutStyles.codePanel}>
        <div className={classNames(styles.textShimmer, styles.title)} />
        <div className={styles.blockShimmer} />
      </Card>
      <div>
        <div className={classNames(styles.textShimmer, styles.large)} />
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
        <Card className={styles.card}>
          <div className={classNames(styles.textShimmer, styles.title)} />
          <div className={styles.textShimmer} />
        </Card>
        {tokenType === LogtoJwtTokenPath.AccessToken && (
          <Card className={styles.card}>
            <div className={styles.textShimmer} />
            <div className={styles.textShimmer} />
          </Card>
        )}
      </div>
    </div>
  );
}

export default PageLoadingSkeleton;
