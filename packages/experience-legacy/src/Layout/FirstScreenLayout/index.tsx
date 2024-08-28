import { type ReactNode, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

import PageMeta from '../../components/PageMeta';
import type { Props as PageMetaProps } from '../../components/PageMeta';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly pageMeta: PageMetaProps;
};

const FirstScreenLayout = ({ children, pageMeta }: Props) => {
  const { platform } = useContext(PageContext);

  return (
    <>
      <PageMeta {...pageMeta} />
      {platform === 'web' && <div className={styles.placeholderTop} />}
      <div className={styles.wrapper}>{children}</div>
      {platform === 'web' && <div className={styles.placeholderBottom} />}
    </>
  );
};

export default FirstScreenLayout;
