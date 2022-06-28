import classNames from 'classnames';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import CodeEditor from '../CodeEditor';
import GithubRawImage from './components/GithubRawImage';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  children: string;
};

const Markdown = ({ className, children }: Props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className={classNames(styles.markdown, className)}
    components={{
      code: ({ node, inline, className, children, ...props }) => {
        const [, codeBlockType] = /language-(\w+)/.exec(className ?? '') ?? [];

        return inline ? (
          <code className={styles.inlineCode} {...props}>
            {children}
          </code>
        ) : (
          <CodeEditor isReadonly language={codeBlockType} value={String(children)} />
        );
      },
      img: ({ src, alt }) => {
        return <GithubRawImage src={src} alt={alt} />;
      },
    }}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
