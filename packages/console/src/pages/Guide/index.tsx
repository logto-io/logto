import { AdminConsoleKey } from '@logto/phrases';
import { MDXProvider } from '@mdx-js/react';
import i18next from 'i18next';
import { MDXProps } from 'mdx/types';
import React, {
  cloneElement,
  isValidElement,
  lazy,
  LazyExoticComponent,
  PropsWithChildren,
  ReactNode,
  Suspense,
  useState,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';
import { GuideForm } from '@/types/guide';

import MultiTextInputField from './components/MultiTextInputField';
import Step from './components/Step';
import * as styles from './index.module.scss';

const Guides: Record<string, LazyExoticComponent<(props: MDXProps) => JSX.Element>> = {
  react: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react.mdx')),
  'react_zh-cn': lazy(
    async () =>
      import(
        '@/assets/i18n/zh-cn/docusaurus-plugin-content-docs/current/tutorial/integrate-sdk/react.mdx'
      )
  ),
};

type Props = PropsWithChildren<{
  title: string;
  subtitle?: AdminConsoleKey;
  /** `subtype` can be an actual type of an application or connector.
   * e.g. React, Angular, Vue, etc. for application. Or Github, WeChat, etc. for connector.
   */
  defaultSubtype?: string;
  bannerComponent?: ReactNode;
  onClose?: () => void;
  onComplete?: (data: GuideForm) => Promise<void>;
}>;

const onClickFetchSampleProject = (projectName: string) => {
  const sampleUrl = `https://github.com/logto-io/js/tree/master/packages/${projectName}-sample`;
  window.open(sampleUrl, '_blank');
};

const Guide = ({
  title,
  subtitle,
  defaultSubtype = '',
  bannerComponent,
  onClose,
  onComplete,
}: Props) => {
  const [subtype, setSubtype] = useState(defaultSubtype);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [invalidStepIndex, setInvalidStepIndex] = useState(-1);

  const locale = i18next.language;
  const guideKey = `${subtype}_${locale}`.toLowerCase();
  const GuideComponent = Guides[guideKey] ?? Guides[subtype];

  const methods = useForm<GuideForm>({ mode: 'onSubmit', reValidateMode: 'onChange' });
  const {
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = handleSubmit((data) => {
    if (isSubmitting) {
      return;
    }
    void onComplete?.(data);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconButton size="large" onClick={onClose}>
          <Close />
        </IconButton>
        <div className={styles.separator} />
        <CardTitle size="small" title={<DangerousRaw>{title}</DangerousRaw>} subtitle={subtitle} />
        <Spacer />
        <Button type="plain" size="small" title="general.skip" onClick={onClose} />
        {subtype && (
          <Button
            type="outline"
            title="admin_console.get_started.get_sample_file"
            onClick={() => {
              onClickFetchSampleProject(subtype);
            }}
          />
        )}
      </div>
      <div className={styles.content}>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            {isValidElement(bannerComponent) &&
              cloneElement(bannerComponent, {
                className: styles.banner,
                onChange: setSubtype,
                onToggle: () => {
                  setActiveStepIndex(0);
                },
              })}
            <MDXProvider
              components={{
                code: ({ className, children }) => {
                  const [, language] = /language-(\w+)/.exec(className ?? '') ?? [];

                  return <CodeEditor isReadonly language={language} value={String(children)} />;
                },
                MultiTextInputField,
                Step,
              }}
            >
              <Suspense fallback={<div>Loading...</div>}>
                {GuideComponent && (
                  <GuideComponent
                    activeStepIndex={activeStepIndex}
                    invalidStepIndex={invalidStepIndex}
                    onNext={(nextIndex: number) => {
                      setActiveStepIndex(nextIndex);
                    }}
                    onError={(invalidIndex: number) => {
                      setInvalidStepIndex(invalidIndex);
                    }}
                  />
                )}
              </Suspense>
            </MDXProvider>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Guide;
