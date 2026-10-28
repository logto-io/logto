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
  /** The SKU the tenant is subscribed to, or was subscribed to before the cancellation. */
  readonly fromSkuId: string;
  /**
   * Before the cancellation, the user can continue without giving feedback, and closing the modal
   * aborts the cancellation.
   */
  readonly stage: 'before_cancel' | 'after_cancel';
  readonly onClose: () => void;
  readonly onSubmit: (hasFeedback: boolean) => void;
};

function CancelFeedbackModal({ isOpen, fromSkuId, stage, onClose, onSubmit }: Props) {
  const postHog = usePostHog();
  const [whatMadeYouCancel, setWhatMadeYouCancel] = useState('');
  const [howToReconsider, setHowToReconsider] = useState('');

  const cancelReason = whatMadeYouCancel.trim();
  const reconsiderSuggestion = howToReconsider.trim();
  const hasFeedback = Boolean(cancelReason || reconsiderSuggestion);
  const isBeforeCancel = stage === 'before_cancel';

  const capture = (properties: Record<string, unknown>) => {
    postHog.capture('console:subscription_cancel_feedback', {
      from_sku_id: fromSkuId,
      stage,
      ...properties,
    });
  };

  const skip = () => {
    capture({ skipped: true });
    onClose();
  };

  const submit = () => {
    capture(
      hasFeedback
        ? {
            ...conditional(cancelReason && { cancel_reason: cancelReason }),
            ...conditional(reconsiderSuggestion && { reconsider_suggestion: reconsiderSuggestion }),
          }
        : { skipped: true }
    );
    onSubmit(hasFeedback);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={skip}
    >
      <ModalLayout
        title={
          isBeforeCancel
            ? 'subscription.cancel_feedback_modal.before_cancel_title'
            : 'subscription.cancel_feedback_modal.title'
        }
        subtitle={
          isBeforeCancel
            ? 'subscription.cancel_feedback_modal.before_cancel_description'
            : 'subscription.cancel_feedback_modal.description'
        }
        footer={
          <Button
            size="large"
            type="primary"
            title={isBeforeCancel ? 'general.continue' : 'general.submit'}
            disabled={!isBeforeCancel && !hasFeedback}
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
