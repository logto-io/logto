import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ErrorPage from '@ac/components/ErrorPage';

import styles from './index.module.scss';

const UpdateSuccess = () => {
  const { accountCenterSettings } = useContext(PageContext);

  if (!accountCenterSettings?.enabled) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  return (
    <div className={styles.container}>
      {/* <PageMeta titleKey="Update success" /> */}
      {/* TODO: update with correct phrase after design ready */}
      <div className={styles.title}>Update success</div>
      <div className={styles.message}>Your changes have been saved successfully.</div>
    </div>
  );
};

export default UpdateSuccess;
