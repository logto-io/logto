import React from 'react';

import Item from './components/Item';
import Section from './components/Section';
import BarGraph from './icons/BarGraph';
import Bolt from './icons/Bolt';
import * as styles from './index.module.scss';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <Section title="Overview">
        <Item icon={<Bolt />} title="Get Started" />
        <Item icon={<BarGraph />} title="Dashboard" />
      </Section>
      <Section title="Resource Management">
        <Item icon={<Bolt />} title="Get Started" />
        <Item icon={<BarGraph />} title="Dashboard" />
      </Section>
    </div>
  );
};

export default Sidebar;
