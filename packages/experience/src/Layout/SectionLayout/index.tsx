import { type TFuncKey } from 'i18next';
import { type ReactNode } from 'react';

import DynamicT from '@/components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  readonly title: TFuncKey;
  readonly description: TFuncKey;
  readonly titleProps?: Record<string, unknown>;
  readonly descriptionProps?: Record<string, unknown>;
  readonly children: ReactNode;
};

const SectionLayout = ({ title, description, titleProps, descriptionProps, children }: Props) => {
  return (
    <div>
      <div className={styles.title}>
        <DynamicT forKey={title} interpolation={titleProps} />
      </div>
      <div className={styles.description}>
        <DynamicT forKey={description} interpolation={descriptionProps} />
      </div>
      {children}
    </div>
  );
};

export default SectionLayout;
