import { AdminConsoleKey } from '@logto/phrases';
import React, { cloneElement, isValidElement, PropsWithChildren, ReactNode, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';
import { GetStartedForm } from '@/types/get-started';

import Step from './components/Step';
import { GetStartedType, useGetStartedSteps } from './hooks';
import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: AdminConsoleKey;
  type: GetStartedType;
  /** `subtype` can be an actual type of an application or connector.
   * e.g. React, Angular, Vue, etc. for application. Or Github, WeChat, etc. for connector.
   */
  defaultSubtype?: string;
  bannerComponent?: ReactNode;
  onClose?: () => void;
  onComplete?: (data: GetStartedForm) => Promise<void>;
}>;

const onClickFetchSampleProject = (projectName: string) => {
  const sampleUrl = `https://github.com/logto-io/js/tree/master/packages/${projectName}-sample`;
  window.open(sampleUrl, '_blank');
};

const GetStarted = ({
  title,
  subtitle,
  type,
  defaultSubtype,
  bannerComponent,
  onClose,
  onComplete,
}: Props) => {
  const [subtype, setSubtype] = useState(defaultSubtype);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const steps = useGetStartedSteps(type, subtype) ?? [];
  const methods = useForm<GetStartedForm>({ reValidateMode: 'onBlur' });
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
            {steps.map((step, index) => {
              const isFinalStep = index === steps.length - 1;

              return (
                <Step
                  key={step.title}
                  data={step}
                  index={index}
                  isActive={activeStepIndex === index}
                  isComplete={activeStepIndex > index}
                  isFinalStep={isFinalStep}
                  onNext={() => {
                    setActiveStepIndex(index + 1);
                  }}
                />
              );
            })}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default GetStarted;
