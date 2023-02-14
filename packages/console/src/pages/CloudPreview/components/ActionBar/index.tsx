import WelcomePageAction from './actions/WelcomePageAction';
import * as styles from './index.module.scss';

const ActionBar = () => {
  return (
    <div className={styles.container}>
      <WelcomePageAction />
    </div>
  );
};

export default ActionBar;
