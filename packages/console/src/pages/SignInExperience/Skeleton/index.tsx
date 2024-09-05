import classNames from 'classnames';

import CardTitle from '@/ds-components/CardTitle';
import Spacer from '@/ds-components/Spacer';

import pageContentStyles from '../PageContent/index.module.scss';
import pageStyles from '../index.module.scss';

import styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={classNames(pageStyles.container, styles.container)}>
      <CardTitle
        title="sign_in_exp.title"
        subtitle="sign_in_exp.description"
        className={pageStyles.cardTitle}
      />
      <div className={classNames(pageContentStyles.tabs, styles.tabBar)} />
      <div className={classNames(pageContentStyles.content, styles.content)}>
        <div className={pageContentStyles.contentTop}>
          <div>
            <div className={styles.card}>
              <div className={styles.title} />
              <div className={styles.field} />
              <div className={styles.field} />
            </div>
            <div className={styles.card}>
              <div className={styles.title} />
              <div className={styles.field} />
              <div className={styles.field} />
            </div>
          </div>
          <div className={pageContentStyles.preview}>
            <div className={styles.preview}>
              <div className={styles.header}>
                <div className={styles.info}>
                  <div className={styles.title} />
                  <div className={styles.subtitle} />
                </div>
                <Spacer />
                <div className={styles.button} />
                <div className={styles.button} />
              </div>
              <div className={styles.previewContent}>
                <div className={styles.mobile}>
                  <div className={styles.logo} />
                  <div className={styles.slogan} />
                  <div className={styles.field} />
                  <div className={styles.field} />
                  <div className={styles.button} />
                  <div className={styles.social} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
