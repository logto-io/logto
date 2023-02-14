import { useContext } from 'react';

import Button from '@/components/Button';
import { CloudPreviewPageContext } from '@/pages/CloudPreview/containers/CloudPreviewPageProvider';

import * as styles from './index.module.scss';

const WelcomePageAction = () => {
  const {
    questionForm: { isSubmitting, isValid, getSubmitHandler },
  } = useContext(CloudPreviewPageContext);

  const handleSubmit = getSubmitHandler();

  const onSubmit = handleSubmit(async (formData) => {
    // TODO @xiaoyijun send data to the backend
    console.log(formData);

    // TODO @xiaoyijun navigate to the about users page
  });

  return (
    <div className={styles.container}>
      <Button
        title="general.next"
        type="primary"
        disabled={isSubmitting || !isValid}
        onClick={onSubmit}
      />
    </div>
  );
};

export default WelcomePageAction;
