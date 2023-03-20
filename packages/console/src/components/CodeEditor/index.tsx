import classNames from 'classnames';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as a11yDarkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import CopyToClipboard from '../CopyToClipboard';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  language?: string;
  isReadonly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  tabSize?: number;
  hasError?: boolean;
  errorMessage?: string;
  placeholder?: string;
};

const CodeEditor = ({
  className,
  language,
  isReadonly = false,
  value,
  onChange,
  tabSize = 2,
  hasError,
  errorMessage,
  placeholder,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<SyntaxHighlighter>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useLayoutEffect(() => {
    // Update textarea width according to its scroll width
    const { current } = textareaRef;

    if (current) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      current.style.width = `${current.scrollWidth}px`;
    }
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;
    onChange?.(value);
  };

  const handleKeydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      const { value, selectionStart } = event.currentTarget;

      event.preventDefault();
      const newText =
        value.slice(0, selectionStart) + ' '.repeat(tabSize) + value.slice(selectionStart);

      // Need to update value to set selection without useEffect
      // eslint-disable-next-line @silverhand/fp/no-mutation
      event.currentTarget.value = newText;
      event.currentTarget.setSelectionRange(selectionStart + tabSize, selectionStart + tabSize);

      onChange?.(newText);
    }
  };

  // TODO @sijie temp solution for required error (the errorMessage is an empty string)
  const finalErrorMessage = useMemo(() => {
    if (errorMessage) {
      return errorMessage;
    }

    return t('general.required');
  }, [errorMessage, t]);

  const maxLineNumberDigits = ((value ?? '').split('\n').length + 1).toString().length;

  return (
    <>
      <div className={classNames(styles.container, className)}>
        {!value && <div className={styles.placeholder}>{placeholder}</div>}
        <CopyToClipboard value={value ?? ''} variant="icon" className={styles.copy} />
        <div className={styles.editor}>
          {/* SyntaxHighlighter is a readonly component, so a transparent <textarea> layer is needed
      in order to support user interactions, such as code editing, copy-pasting, etc. */}
          <textarea
            ref={textareaRef}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            readOnly={isReadonly}
            spellCheck="false"
            value={value}
            style={{
              marginLeft: `calc(${maxLineNumberDigits}ch + 20px)`,
              width: `calc(100% - ${maxLineNumberDigits}ch - 20px)`,
            }}
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
          {/* SyntaxHighlighter will generate a <pre> tag and a inner <code> tag. Both have
      inline-styles by default. Therefore, We can only use inline styles to customize them.
      Some styles have to be applied multiple times to each of them for the sake of consistency. */}
          <SyntaxHighlighter
            showLineNumbers
            showInlineLineNumbers
            width={textareaRef.current?.scrollWidth ?? 0}
            lineNumberContainerStyle={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'right',
              paddingLeft: '0px',
              paddingRight: '0px',
            }}
            lineNumberStyle={{
              marginLeft: '0px',
              paddingRight: '20px',
              paddingLeft: '0px',
              display: 'inline-flex',
              justifyContent: 'flex-end',
              counterIncrement: 'line',
              lineHeight: '1.5',
              flexShrink: 0,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: '14px',
              minWidth: `calc(${maxLineNumberDigits}ch + 20px)`,
              position: 'sticky',
              background: '#34353f',
              left: 0,
            }}
            codeTagProps={{
              style: {
                fontFamily: "'Roboto Mono', monospace", // Override default font-family of <code>
              },
            }}
            customStyle={{
              width: `${textareaRef.current?.scrollWidth ?? 0}px`,
              background: 'transparent',
              fontSize: '14px',
              margin: '0',
              padding: '0',
              borderRadius: '0',
              wordBreak: 'break-all',
              overflow: 'unset',
              fontFamily: "'Roboto Mono', monospace", // Override default font-family of <pre>
            }}
            language={language}
            style={a11yDarkTheme}
          >
            {value ?? ''}
          </SyntaxHighlighter>
        </div>
      </div>
      {hasError && <div className={styles.errorMessage}>{finalErrorMessage}</div>}
    </>
  );
};

export default CodeEditor;
