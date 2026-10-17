import classNames from 'classnames';
import { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Without this, the markdown renderer can crash in the parcel dev build. See components/Markdown.
// eslint-disable-next-line import/no-unassigned-import -- Side-effect import works around a parcel dev-build crash.
import 'property-information';

import styles from './index.module.scss';

type Props = {
  readonly sender: 'user' | 'assistant';
  readonly content: string;
  readonly icon: ReactNode;
};

function MessageBubble({ sender, content, icon }: Props) {
  return (
    <div className={classNames(styles.row, sender === 'user' && styles.userRow)}>
      {sender === 'assistant' && <div className={styles.avatar}>{icon}</div>}
      <div
        className={classNames(
          styles.bubble,
          sender === 'user' ? styles.userBubble : styles.assistantBubble
        )}
      >
        {sender === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
