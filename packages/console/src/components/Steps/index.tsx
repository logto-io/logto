import StepItem, { type StepItemProps } from './components/StepItem';
import { type StepStatus } from './components/StepItem/Status';

export type StepsProps = {
  stepItems: Array<Pick<StepItemProps, 'title' | 'content' | 'isContentVisibleOnFinished'>>;
  currentStep: number;
  currentStatus: StepStatus;
  classNames?: string;
};

function Steps({ stepItems, currentStep, currentStatus, classNames }: StepsProps) {
  const getStepItemStatus = (step: number): StepStatus =>
    step < currentStep ? 'finished' : step === currentStep ? currentStatus : 'pending';

  return (
    <div className={classNames}>
      {stepItems.map((step, index) => {
        const itemStep = index + 1;

        return (
          <StepItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            step={itemStep}
            currentStep={currentStep}
            status={getStepItemStatus(itemStep)}
            isDashLineVisible={itemStep < stepItems.length}
            {...step}
          />
        );
      })}
    </div>
  );
}

export default Steps;
