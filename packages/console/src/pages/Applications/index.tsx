import React from 'react';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';

import * as styles from './index.module.scss';

const Applications = () => {
  return (
    <Card>
      <div className={styles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button disabled title="admin_console.applications.create" />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td className={styles.applicationName}>Application Name</td>
            <td>Client ID</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ItemPreview
                title="Default App"
                subtitle="Single Page Application"
                icon={<ImagePlaceholder />}
              />
            </td>
            <td>
              <CopyToClipboard value="RUMatENw0rFWO5aGbMI8tY2Qol50eOg3" />
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
};

export default Applications;
