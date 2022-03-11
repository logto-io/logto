import MonacoEditor from '@monaco-editor/react';
import React from 'react';

import * as styles from './index.module.scss';

type Props = {
  language: string;
  isDarkMode?: boolean;
  height?: string;
  isReadonly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

const CodeEditor = ({
  value,
  onChange,
  language,
  height = '300px',
  isReadonly = false,
  isDarkMode,
}: Props) => {
  const handleChange = (changedValue: string | undefined) => {
    onChange?.(changedValue ?? '');
  };

  // See https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.EditorOption.html
  const options = {
    readOnly: isReadonly,
    scrollBeyondLastLine: false,
    codeLens: false,
    minimap: {
      enabled: false,
    },
    folding: false,
  };

  return (
    <div className={styles.editor}>
      <MonacoEditor
        language={language}
        height={height}
        theme={isDarkMode ? 'vs-dark' : 'vs-light'}
        value={value}
        options={options}
        onChange={handleChange}
      />
    </div>
  );
};

export default CodeEditor;
