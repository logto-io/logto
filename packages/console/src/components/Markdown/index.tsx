import type { Optional } from '@silverhand/essentials';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { memo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: @charles double check if this is still needed
/**
 * Workaround for the markdown crash issue in the parcel dev build. It seems parcel does
 * something clever in dev mode and messing up the `hastToReact` module. Manually adding
 * the `property-information` import somehow keeps the reference and makes dev build work.
 * @see https://github.com/remarkjs/react-markdown/issues/747
 * @see https://github.com/parcel-bundler/parcel/discussions/9113
 */
// eslint-disable-next-line import/no-unassigned-import
import 'property-information';

import CodeEditor from '@/ds-components/CodeEditor';

import GithubRawImage from './components/GithubRawImage';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly children: string;
};

function Markdown({ className, children }: Props) {
  const tocIdSet = useRef<Set<string>>(new Set());

  const generateTocId = (text: string): Optional<string> => {
    const resolveIdCollision = (kebabCaseString: string, index = 0): string => {
      const result = `${kebabCaseString}${conditionalString(index && `-${index}`)}`;

      if (!tocIdSet.current.has(result)) {
        tocIdSet.current.add(result);

        return result;
      }

      return resolveIdCollision(kebabCaseString, index + 1);
    };

    const initialKebabCaseString = text
      // Remove all symbols and punctuations except for dash and underscore. https://javascript.info/regexp-unicode
      .replaceAll(/\p{S}|\p{Pi}|\p{Pf}|\p{Ps}|\p{Pe}|\p{Po}/gu, '')
      .replaceAll(/\s+/g, '-')
      .toLowerCase();

    return resolveIdCollision(initialKebabCaseString);
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={classNames(styles.markdown, className)}
      components={{
        code: ({ className, children, ...props }) => {
          const [, codeBlockType] = /language-(\w+)/.exec(className ?? '') ?? [];

          return codeBlockType ? (
            <CodeEditor isReadonly language={codeBlockType} value={String(children)} />
          ) : (
            <code className={styles.inlineCode} {...props}>
              {children}
            </code>
          );
        },
        img: ({ src, alt }) => {
          return <GithubRawImage src={src} alt={alt} />;
        },
        a: ({ href, children }) => {
          const isExternalLink = href?.startsWith('http');

          return (
            <a href={href} target={isExternalLink ? '_blank' : '_self'} rel="noopener">
              {children}
            </a>
          );
        },
        h1: ({ children }) => <h1 id={generateTocId(String(children))}>{children}</h1>,
        h2: ({ children }) => <h2 id={generateTocId(String(children))}>{children}</h2>,
        h3: ({ children }) => <h3 id={generateTocId(String(children))}>{children}</h3>,
        h4: ({ children }) => <h4 id={generateTocId(String(children))}>{children}</h4>,
        h5: ({ children }) => <h5 id={generateTocId(String(children))}>{children}</h5>,
        h6: ({ children }) => <h6 id={generateTocId(String(children))}>{children}</h6>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default memo(Markdown);
