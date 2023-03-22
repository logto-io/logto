import { useFormContext, Controller } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import TextLink from '@/components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import type { SignInExperienceForm } from '../../types';
import * as tabsStyles from '../index.module.scss';
import * as brandingStyles from './CustomCssForm.module.scss';

function CustomCssForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <div className={tabsStyles.title}>{t('sign_in_exp.custom_css.title')}</div>
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
                      href={getDocumentationUrl('/docs/recipes/customize-sie/custom-css')}
                      target="_blank"
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
