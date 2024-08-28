import { useFormContext, Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import * as brandingStyles from './index.module.scss';

function CustomCssForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <FormSectionTitle title="custom_css.title" />
      <FormField
        title="sign_in_exp.custom_css.css_code_editor_title"
        tip={(closeTipHandler) => (
          <>
            <div>{t('sign_in_exp.custom_css.css_code_editor_description1')}</div>
            <div>
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank="noopener"
                      href={getDocumentationUrl('/docs/recipes/customize-sie/custom-css')}
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('sign_in_exp.custom_css.css_code_editor_description2', {
                  link: t('sign_in_exp.custom_css.css_code_editor_description_link_content'),
                })}
              </Trans>
            </div>
          </>
        )}
      >
        <Controller
          name="customCss"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CodeEditor
              className={brandingStyles.customCssCodeEditor}
              language="scss"
              value={value ?? undefined}
              placeholder={t('sign_in_exp.custom_css.css_code_editor_content_placeholder')}
              onChange={onChange}
            />
          )}
        />
      </FormField>
    </Card>
  );
}

export default CustomCssForm;
