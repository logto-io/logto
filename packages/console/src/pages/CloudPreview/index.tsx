import { Outlet } from 'react-router-dom';

import ActionBar from './components/ActionBar';
import CloudPreviewPageProvider from './containers/CloudPreviewPageProvider';
import * as styles from './index.module.scss';

const CloudPreview = () => {
  return (
    <CloudPreviewPageProvider>
      <div className={styles.cloudPreview}>
        <Outlet />
        <ActionBar />
      </div>
    </CloudPreviewPageProvider>
  );
};

export default CloudPreview;
