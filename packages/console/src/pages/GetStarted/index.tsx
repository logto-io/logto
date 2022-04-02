import { AdminConsoleKey } from '@logto/phrases';
import { Nullable } from '@silverhand/essentials';
import React, {
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Close from '@/icons/Close';

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
  onComplete?: () => void;
  onToggleSteps?: () => void;
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
  onToggleSteps,
}: Props) => {
  const [subtype, setSubtype] = useState(defaultSubtype);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const steps = useGetStartedSteps(type, subtype) ?? [];

  const stepReferences = useRef<Array<Nullable<HTMLDivElement>>>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    Array.from<null>({ length: steps.length }).fill(null)
  );

  useEffect(() => {
    if (activeStepIndex > -1) {
      const activeStepRef = stepReferences.current[activeStepIndex];
      activeStepRef?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [activeStepIndex, stepReferences]);

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
            title="admin_console.applications.get_started.get_sample_file"
            onClick={() => {
              onClickFetchSampleProject(subtype);
            }}
          />
        )}
      </div>
      <div className={styles.content}>
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
              ref={(element) => {
                // eslint-disable-next-line @silverhand/fp/no-mutation
                stepReferences.current[index] = element;
              }}
              data={step}
              index={index}
              isCompleted={activeStepIndex > index}
              isExpanded={activeStepIndex === index}
              isFinalStep={isFinalStep}
              onComplete={onComplete}
              onNext={() => {
                setActiveStepIndex(index + 1);
              }}
              onToggle={() => {
                setActiveStepIndex(index);
                onToggleSteps?.();
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GetStarted;
