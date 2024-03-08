import { Editor, type BeforeMount, type OnMount, useMonaco } from '@monaco-editor/react';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { onKeyDownHandler } from '@/utils/a11y';

import CodeClearButton from './ActionButton/CodeClearButton.js';
import CodeRestoreButton from './ActionButton/CodeRestoreButton.js';
import { logtoDarkTheme, defaultOptions } from './config.js';
import * as styles from './index.module.scss';
import type { IStandaloneCodeEditor, Model } from './type.js';
import useEditorHeight from './use-editor-height.js';

export type { Model } from './type.js';

type ActionButtonType = 'clear' | 'restore' | 'copy';

type Props = {
  className?: string;
  enabledActions?: ActionButtonType[];
  models: Model[];
  onChange?: (value: string | undefined, modelName: string) => void;
};

function MonacoCodeEditor({ className, enabledActions = ['copy'], models, onChange }: Props) {
  const monaco = useMonaco();
  const editorRef = useRef<Nullable<IStandaloneCodeEditor>>(null);

  const [activeModelName, setActiveModelName] = useState<string>();

  const activeModel = useMemo(
    () => models.find((model) => model.name === activeModelName),
    [activeModelName, models]
  );

  const isMultiModals = useMemo(() => models.length > 1, [models]);

  // Get the container ref and the editor height
  const { containerRef, editorHeight } = useEditorHeight();

  // Set the first model as the active model
  useEffect(() => {
    setActiveModelName(models[0]?.name);
  }, [models]);

  useEffect(() => {
    // Monaco will be ready after the editor is mounted, useEffect will be called after the monaco is ready
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
          {enabledActions.includes('clear') && (
            <CodeClearButton
              onClick={() => {
                if (activeModel) {
                  onChange?.(undefined, activeModel.name);
                }
              }}
            />
          )}
          {enabledActions.includes('restore') && (
            <CodeRestoreButton
              onClick={() => {
                if (activeModel) {
                  onChange?.(activeModel.defaultValue, activeModel.name);
                }
              }}
            />
          )}
          {enabledActions.includes('copy') && (
            <CopyToClipboard variant="icon" value={editorRef.current?.getValue() ?? ''} />
          )}
        </div>
      </header>
      <div ref={containerRef} className={styles.editorContainer}>
        <Editor
          height={editorHeight}
          language={activeModel?.language ?? 'typescript'}
          value={activeModel?.value}
          path={activeModel?.name}
          theme="logto-dark"
          options={defaultOptions}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={
            onChange &&
            activeModel &&
            ((value) => {
              onChange(value, activeModel.name);
            })
          }
        />
      </div>
    </div>
  );
}

export default MonacoCodeEditor;
