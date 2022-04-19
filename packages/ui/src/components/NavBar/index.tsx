import React from 'react';
import { useNavigate } from 'react-router-dom';

import { NavArrowIcon } from '../Icons';
import * as styles from './index.module.scss';

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.navBar}>
      <NavArrowIcon
        onClick={() => {
          navigate(-1);
        }}
      />
    </div>
  );
};

export default NavBar;
