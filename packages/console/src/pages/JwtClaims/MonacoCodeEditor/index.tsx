import { Editor, type BeforeMount, type OnMount, useMonaco } from '@monaco-editor/react';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { onKeyDownHandler } from '@/utils/a11y';

import { logtoDarkTheme, defaultOptions } from './config.js';
import * as styles from './index.module.scss';
import type { IStandaloneCodeEditor, Model } from './type.js';
import useEditorHeight from './use-editor-height.js';

export type { Model } from './type.js';

type Props = {
  className?: string;
  actions?: React.ReactNode;
  models: Model[];
};

function MonacoCodeEditor({ className, actions, models }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const monaco = useMonaco();
  const editorRef = useRef<Nullable<IStandaloneCodeEditor>>(null);

  const [activeModelName, setActiveModelName] = useState<string>();

  const activeModel = useMemo(
    () => models.find((model) => model.name === activeModelName),
    [activeModelName, models]
  );

  const isMultiModals = useMemo(() => models.length > 1, [models]);

  const { containerRef, editorHeight } = useEditorHeight();

  // Set the first model as the active model
  useEffect(() => {
    setActiveModelName(models[0]?.name);
  }, [models]);

  useEffect(() => {
    // Add global declarations
    // monaco will be ready after the editor is mounted, useEffect will be called after the monaco is ready
    if (!monaco || !activeModel) {
      return;
    }

    // Set the global declarations for the active model
    // @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.typescript.LanguageServiceDefaults.html#setExtraLibs}
    if (activeModel.globalDeclarations) {
      monaco.languages.typescript.typescriptDefaults.setExtraLibs([
        {
          content: activeModel.globalDeclarations,
          filePath: `file:///global.d.ts`,
        },
      ]);
    }
  }, [activeModel, monaco]);

  const handleCodeCopy = useCallback(async () => {
    const editor = editorRef.current;

    if (editor) {
      const code = editor.getValue();
      await navigator.clipboard.writeText(code);
      toast.success(t('general.copied'));
    }
  }, [t]);

  const handleEditorWillMount = useCallback<BeforeMount>((monaco) => {
    // Register the new logto theme
    monaco.editor.defineTheme('logto-dark', logtoDarkTheme);
  }, []);

  const handleEditorDidMount = useCallback<OnMount>((editor) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    editorRef.current = editor;
  }, []);

  return (
    <div className={classNames(className, styles.codeEditor)}>
      <header>
        <div className={styles.tabList}>
          {models.map(({ name, title, icon }) => (
            <div
              key={name}
              className={classNames(
                styles.tab,
                isMultiModals && styles.tabButton,
                name === activeModelName && styles.active
              )}
              {...(isMultiModals && {
                role: 'button',
                tabIndex: 0,
                onClick: () => {
                  setActiveModelName(name);
                },
                onKeyDown: onKeyDownHandler(() => {
                  setActiveModelName(name);
                }),
              })}
            >
              {icon}
              {title}
            </div>
          ))}
        </div>
        <div className={styles.actionButtons}>
          {actions}
          <CopyToClipboard variant="icon" value={editorRef.current?.getValue() ?? ''} />
        </div>
      </header>
      <div ref={containerRef} className={styles.editorContainer}>
        <Editor
          height={editorHeight}
          language={activeModel?.language ?? 'typescript'}
          // TODO: need to check on the usage of value and defaultValue
          defaultValue={activeModel?.defaultValue}
          path={activeModel?.name}
          theme="logto-dark"
          options={defaultOptions}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}

export default MonacoCodeEditor;
