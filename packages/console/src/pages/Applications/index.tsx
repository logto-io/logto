import React from 'react';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';

import * as styles from './index.module.scss';

const Applications = () => {
  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button title="admin_console.applications.create" />
      </div>
    </Card>
  );
};

export default Applications;
