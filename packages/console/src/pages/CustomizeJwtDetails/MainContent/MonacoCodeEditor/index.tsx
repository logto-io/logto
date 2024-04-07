import { Theme } from '@logto/schemas';
import { Editor, useMonaco, type OnMount } from '@monaco-editor/react';
import { type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

import CodeRestoreButton from './ActionButton/CodeRestoreButton.js';
import DashBoard, { type Props as DashboardProps } from './Dashboard';
import { defaultOptions, logtoDarkTheme, logtoLightTheme } from './config.js';
import * as styles from './index.module.scss';
import type { IStandaloneCodeEditor, ModelSettings } from './type.js';
import useEditorHeight from './use-editor-height.js';

export type { Props as DashboardProps } from './Dashboard';
export type { ModelControl, ModelSettings } from './type.js';

type ActionButtonType = 'restore' | 'copy';

type Props = {
  className?: string;
  enabledActions?: ActionButtonType[];
  models: ModelSettings[];
  activeModelName?: string;
  setActiveModel?: (name: string) => void;
  value?: string;
  environmentVariablesDefinition?: string;
  onChange?: (value: string | undefined) => void;
  onMountHandler?: (editor: IStandaloneCodeEditor) => void;
  actionButtons?: ReactNode;
  dashboard?: DashboardProps;
};
/**
 * Monaco code editor component.
 * @param {Props} prop
 * @param {string} [prop.className] - The class name of the component.
 * @param {ActionButtonType[]} prop.enabledActions - The enabled action buttons, available values are 'clear', 'restore', 'copy'.
 * @param {ModelSettings[]} prop.models - The static model settings (all tabs) for the code editor.
 * @param {string} prop.activeModelName - The active model name.
 * @param {(name: string) => void} prop.setActiveModel - The callback function to set the active model. Used to switch between tabs.
 * @param {string} prop.value - The value of the code editor for the current active model.
 * @param {(value: string | undefined) => void} prop.onChange - The callback function to handle the value change of the code editor.
 * @param {string} [prop.environmentVariablesDefinition] - The environment variables type definition for the script section.
 * @param {ReactNode} [actionButtons] - Additional action buttons shown on the header
 * @param {DashboardProps} [dashboard] - The dashboard component shown at the bottom of the editor.
 *
 * @returns
 */
function MonacoCodeEditor({
  className,
  enabledActions = ['copy'],
  models,
  activeModelName,
  value,
  environmentVariablesDefinition,
  setActiveModel,
  onChange,
  onMountHandler,
  actionButtons,
  dashboard,
}: Props) {
  const monaco = useMonaco();
  const editorRef = useRef<Nullable<IStandaloneCodeEditor>>(null);
  const theme = useTheme();

  const activeModel = useMemo(
    () => activeModelName && models.find((model) => model.name === activeModelName),
    [activeModelName, models]
  );

  const isMultiModals = useMemo(() => models.length > 1, [models]);

  // Get the container ref and the editor height
  const { containerRef, editorHeight } = useEditorHeight();

  // Handle editor extraLibs and language compile settings
  useEffect(() => {
    // Monaco will be ready after the editor is mounted, useEffect will be called after the monaco is ready
    if (!monaco || !activeModel) {
      return;
    }

    // Set the global declarations for the active model
    // @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.typescript.LanguageServiceDefaults.html#setExtraLibs}
    if (activeModel.extraLibs) {
      monaco.languages.typescript.typescriptDefaults.setExtraLibs(activeModel.extraLibs);
    }

    // Set the environment variables type definition for the active model
    if (environmentVariablesDefinition) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        environmentVariablesDefinition,
        'environmentVariables.d.ts'
      );
    }

    if (activeModel.language === 'typescript') {
      // Set the typescript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        allowNonTsExtensions: true,
        strictNullChecks: true,
      });
    }
  }, [activeModel, monaco, environmentVariablesDefinition]);

  // Handle the editor theme settings
  useEffect(() => {
    // Monaco will be ready after the editor is mounted, useEffect will be called after the monaco is ready
    if (!monaco) {
      return;
    }

    const editorTheme = theme === Theme.Light ? logtoLightTheme : logtoDarkTheme;

    monaco.editor.defineTheme('logto-dark', editorTheme);
  }, [monaco, theme]);

  const handleEditorDidMount = useCallback<OnMount>(
    (editor) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      editorRef.current = editor;
      onMountHandler?.(editor);
    },
    [onMountHandler]
  );

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
                  setActiveModel?.(name);
                },
                onKeyDown: onKeyDownHandler(() => {
                  setActiveModel?.(name);
                }),
              })}
            >
              {icon}
              {title}
            </div>
          ))}
        </div>
        <div className={styles.actionButtons}>
          {enabledActions.includes('restore') && (
            <CodeRestoreButton
              className={styles.iconButton}
              onClick={() => {
                if (activeModel && value !== activeModel.defaultValue) {
                  onChange?.(activeModel.defaultValue);
                }
              }}
            />
          )}
          {enabledActions.includes('copy') && (
            <CopyToClipboard
              variant="icon"
              value={editorRef.current?.getValue() ?? ''}
              className={styles.iconButton}
            />
          )}
          {actionButtons}
        </div>
      </header>
      <div
        ref={containerRef}
        className={classNames(styles.editorContainer, dashboard && styles.dashboardOpen)}
      >
        {activeModel && (
          <Editor
            height={editorHeight}
            language={activeModel.language}
            path={activeModel.name}
            theme="logto-dark"
            options={{
              ...defaultOptions,
              ...activeModel.options,
            }}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string is falsy
            value={value || activeModel.defaultValue}
            onMount={handleEditorDidMount}
            onChange={onChange}
          />
        )}
      </div>
      {dashboard && <DashBoard {...dashboard} className={styles.resultPanel} />}
    </div>
  );
}

export default MonacoCodeEditor;
