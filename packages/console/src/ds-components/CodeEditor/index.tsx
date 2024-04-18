import classNames from 'classnames';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark as a11yDarkTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import CopyToClipboard from '../CopyToClipboard';

import * as styles from './index.module.scss';
import { lineNumberContainerStyle, lineNumberStyle, customStyle } from './utils';

type Props = {
  readonly className?: string;
  readonly language?: string;
  readonly isReadonly?: boolean;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly tabSize?: number;
  readonly error?: string | boolean;
  readonly placeholder?: string;
};

function CodeEditor({
  className,
  language,
  isReadonly = false,
  value,
  onChange,
  tabSize = 2,
  error,
  placeholder,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useLayoutEffect(() => {
    // Update textarea width according to its scroll width
    const { current } = textareaRef;

    if (current && current.style.width !== `${current.scrollWidth}px`) {
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

    /**
     * Since lineNumber container could cover leftmost part of the editor,
     * when user is clicking on "Enter", should manually scroll to the leftmost.
     */
    if (event.key === 'Enter' && editorRef.current && editorRef.current.scrollLeft !== 0) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      editorRef.current.scrollLeft = 0;
    }
  };

  // TODO @sijie temp solution for required error (the errorMessage is an empty string)
  const finalErrorMessage = typeof error === 'string' ? error : t('general.required');

  const maxLineNumberDigits = (value ?? '').split('\n').length.toString().length;
  const isShowingPlaceholder = !value;

  return (
    <>
      <div className={classNames(styles.container, className)}>
        {isShowingPlaceholder && <div className={styles.placeholder}>{placeholder}</div>}
        <CopyToClipboard value={value ?? ''} variant="icon" className={styles.copy} />
        <div ref={editorRef} className={classNames(styles.editor, isReadonly && styles.readonly)}>
          {/* SyntaxHighlighter is a readonly component, so a transparent <textarea> layer is needed
      in order to support user interactions, such as code editing, copy-pasting, etc. */}
          <textarea
            ref={textareaRef}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            data-gramm="false"
            wrap="false"
            readOnly={isReadonly}
            spellCheck="false"
            value={value}
            style={
              isShowingPlaceholder
                ? { marginLeft: '8px', width: 'calc(100% - 8px)' }
                : {
                    marginLeft: `calc(${maxLineNumberDigits}ch + 20px)`,
                    width: `calc(100% - ${maxLineNumberDigits}ch - 20px)`,
                  }
            }
            onChange={handleChange}
            onKeyDown={handleKeydown}
          />
          {/* SyntaxHighlighter will generate a <pre> tag and a inner <code> tag. Both have
      inline-styles by default. Therefore, We can only use inline styles to customize them.
      Some styles have to be applied multiple times to each of them for the sake of consistency. */}
          <SyntaxHighlighter
            showInlineLineNumbers
            showLineNumbers={!isShowingPlaceholder}
            width={textareaRef.current?.scrollWidth ?? 0}
            lineNumberContainerStyle={lineNumberContainerStyle()}
            lineNumberStyle={lineNumberStyle(maxLineNumberDigits)}
            codeTagProps={{
              style: {
                fontFamily: "'Roboto Mono', monospace", // Override default font-family of <code>
              },
            }}
            customStyle={customStyle(textareaRef.current?.scrollWidth)}
            language={language}
            style={a11yDarkTheme}
          >
            {value ?? ''}
          </SyntaxHighlighter>
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{finalErrorMessage}</div>}
    </>
  );
}

export default CodeEditor;
