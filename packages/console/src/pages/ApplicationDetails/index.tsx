import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

import * as buttonStyles from '@/components/TextButton/index.module.scss';

import Back from './icons/Back';
import * as styles from './index.module.scss';

const ApplicationDetails = () => {
  return (
    <div>
      <Link to="/applications" className={classNames(buttonStyles.button, styles.button)}>
        <div className={styles.container}>
          <Back />
          <div>Back to Applications</div>
        </div>
      </Link>
    </div>
  );
};

export default ApplicationDetails;
