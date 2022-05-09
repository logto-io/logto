import React, { ChangeEvent } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line node/file-extension-in-import
import { a11yDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import CopyToClipboard from '../CopyToClipboard';
import * as styles from './index.module.scss';

type Props = {
  language?: string;
  isReadonly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

const CodeEditor = ({ language, isReadonly = false, value = '', onChange }: Props) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.currentTarget.value);
  };

  return (
    <div className={styles.container}>
      <CopyToClipboard value={value} variant="icon" className={styles.copy} />
      <div className={styles.editor}>
        <textarea
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          data-gramm="false"
          readOnly={isReadonly}
          spellCheck="false"
          onChange={handleChange}
        >
          {value}
        </textarea>
        <SyntaxHighlighter
          customStyle={{
            background: 'transparent',
            fontSize: '14px',
            margin: '0',
            padding: '0',
            borderRadius: '0',
          }}
          language={language}
          style={theme}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeEditor;
