import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import * as styles from './index.module.scss';

type Props = {
  children: string;
};

const Markdown = ({ children }: Props) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} className={styles.markdown}>
    {children}
  </ReactMarkdown>
);

export default Markdown;
