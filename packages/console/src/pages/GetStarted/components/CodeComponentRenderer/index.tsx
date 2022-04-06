import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CodeProps } from 'react-markdown/lib/ast-to-react.js';

import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import FormField from '@/components/FormField';
import MultiTextInput from '@/components/MultiTextInput';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import { GetStartedForm } from '@/types/get-started';
import { noSpaceRegex } from '@/utilities/regex';

type Props = PropsWithChildren<CodeProps> & { onError: () => void };

const CodeComponentRenderer = ({ className, children, onError }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<GetStartedForm>();

  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [, codeBlockType] = /language-(\w+)/.exec(className ?? '') ?? [];
  const content = String(children);

  /** Code block types defined in markdown. E.g.
   * ```typescript
   * some code
   * ```
   * These two custom code block types should be replaced with `MultiTextInput` component:
   * 'redirectUris' and 'postLogoutRedirectUris'
   */
  const isMultilineInput =
    codeBlockType === 'redirectUris' || codeBlockType === 'postLogoutRedirectUris';

  const firstErrorKey = Object.keys(errors)[0];
  const isFirstErrorField = firstErrorKey && firstErrorKey === codeBlockType;

  useEffect(() => {
    if (isFirstErrorField) {
      onError();
    }
  }, [isFirstErrorField, onError]);

  if (isMultilineInput) {
    return (
      <FormField isRequired title={<DangerousRaw>{content}</DangerousRaw>}>
        <Controller
          name={codeBlockType}
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf({
              required: t('errors.required_field_missing_plural', { field: content }),
              pattern: {
                regex: noSpaceRegex,
                message: t('errors.no_space_in_uri'),
              },
            }),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div ref={ref}>
              <MultiTextInput
                value={value}
                error={convertRhfErrorMessage(error?.message)}
                onChange={onChange}
              />
            </div>
          )}
        />
      </FormField>
    );
  }

  return <CodeEditor isReadonly language={codeBlockType} value={content} />;
};

export default CodeComponentRenderer;
