import { useContext } from 'react';

import { CloudPreviewPageContext } from '../../containers/CloudPreviewPageProvider';
import { CloudPreviewPage } from '../../types';
import WelcomePageAction from './actions/WelcomePageAction';
import * as styles from './index.module.scss';

const ActionBar = () => {
  const { currentPage } = useContext(CloudPreviewPageContext);

  return (
    <div className={styles.container}>
      {currentPage === CloudPreviewPage.Welcome && <WelcomePageAction />}
    </div>
  );
};

export default ActionBar;
