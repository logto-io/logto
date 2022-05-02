import React from 'react';
import { useNavigate } from 'react-router-dom';

import { NavArrowIcon } from '@/components/Icons';

import * as styles from './index.module.scss';

type Props = {
  title?: string;
};

const NavBar = ({ title }: Props) => {
  const navigate = useNavigate();

  return (
    <div className={styles.navBar}>
      <NavArrowIcon
        onClick={() => {
          navigate(-1);
        }}
      />
      {title && <div className={styles.title}>{title}</div>}
    </div>
  );
};

export default NavBar;
