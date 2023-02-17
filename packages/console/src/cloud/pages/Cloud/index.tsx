import { Navigate, Route, Routes } from 'react-router-dom';

import { CloudPage } from '@/cloud/types';
import NotFound from '@/pages/NotFound';

import About from '../About';
import Congrats from '../Congrats';
import Welcome from '../Welcome';
import * as styles from './index.module.scss';

const Cloud = () => (
  <div className={styles.cloud}>
    <Routes>
      <Route index element={<Navigate replace to={CloudPage.Welcome} />} />
      <Route path={CloudPage.Welcome} element={<Welcome />} />
      <Route path={CloudPage.AboutUser} element={<About />} />
      <Route path={CloudPage.Congrats} element={<Congrats />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </div>
);

export default Cloud;
