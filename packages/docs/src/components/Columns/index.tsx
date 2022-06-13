import React, { ReactNode } from 'react';
import styles from './index.module.scss';

export type Column = {
  title: string;
  items: Array<{ key: string; node?: ReactNode[]; }>;
};

type Props = {
  columns: Column[];
};

const Columns = ({ columns }: Props) => {
  return (
    <div className={styles.container}>
      {columns.map(({ title, items }) => (
        <div key={title}>
          <h4>{title}</h4>
          <ul>
            {items.map(({ key, node }) => (<li key={key}>{node ?? key}</li>))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Columns;
