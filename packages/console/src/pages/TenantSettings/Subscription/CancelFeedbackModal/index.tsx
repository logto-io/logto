import { conditional } from '@silverhand/essentials';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import Textarea from '@/ds-components/Textarea';
import modalStyles from '@/scss/modal.module.scss';

type Props = {
  readonly isOpen: boolean;
  /** The SKU the tenant was subscribed to before the cancellation. */
  readonly fromSkuId: string;
  readonly onClose: () => void;
};

function CancelFeedbackModal({ isOpen, fromSkuId, onClose }: Props) {
  const postHog = usePostHog();
  const [whatMadeYouCancel, setWhatMadeYouCancel] = useState('');
  const [howToReconsider, setHowToReconsider] = useState('');

  const cancelReason = whatMadeYouCancel.trim();
  const reconsiderSuggestion = howToReconsider.trim();

  const captureAndClose = (properties: Record<string, unknown>) => {
    postHog.capture('console:subscription_cancel_feedback', {
      from_sku_id: fromSkuId,
      ...properties,
    });
    onClose();
  };

  const skip = () => {
    captureAndClose({ skipped: true });
  };

  const submit = () => {
    captureAndClose({
      ...conditional(cancelReason && { cancel_reason: cancelReason }),
      ...conditional(reconsiderSuggestion && { reconsider_suggestion: reconsiderSuggestion }),
    });
  };

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={skip}
    >
      <ModalLayout
        title="subscription.cancel_feedback_modal.title"
        subtitle="subscription.cancel_feedback_modal.description"
        footer={
          <Button
            size="large"
            type="primary"
            title="general.submit"
            disabled={!cancelReason && !reconsiderSuggestion}
            onClick={submit}
          />
        }
        onClose={skip}
      >
        <FormField title="subscription.cancel_feedback_modal.what_made_you_cancel">
          <Textarea
            rows={4}
            value={whatMadeYouCancel}
            onChange={({ currentTarget: { value } }) => {
              setWhatMadeYouCancel(value);
            }}
          />
        </FormField>
        <FormField title="subscription.cancel_feedback_modal.how_to_reconsider">
          <Textarea
            rows={4}
            value={howToReconsider}
            onChange={({ currentTarget: { value } }) => {
              setHowToReconsider(value);
            }}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default CancelFeedbackModal;
