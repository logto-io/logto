import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { type ReactNode } from 'react';
import { toast } from 'react-hot-toast';

import Error from '@/assets/icons/toast-error.svg?react';
import Success from '@/assets/icons/toast-success.svg?react';
import TextLink from '@/ds-components/TextLink';

import DynamicT from '../DynamicT';

import styles from './index.module.scss';

type ToastVariant = 'success' | 'error';

type ToastWithActionProps = {
  readonly message: ReactNode;
  readonly variant: ToastVariant;
  readonly actionText: AdminConsoleKey;
  readonly actionHref: string;
};

/**
 * A generic toast component with an action link.
 * Can be used for success or error toasts that require user interaction.
 */
function ToastWithAction({ message, variant, actionText, actionHref }: ToastWithActionProps) {
  const icon = variant === 'success' ? <Success /> : <Error />;

  return (
    <div className={classNames(styles.toast, styles[variant], styles.withAction)}>
      <div className={styles.image}>{icon}</div>
      <div className={styles.message}>{message}</div>
      <TextLink href={actionHref} className={styles.action}>
        <DynamicT forKey={actionText} />
      </TextLink>
    </div>
  );
}

/**
 * Display a toast with an action link.
 *
 * @example
 * ```tsx
 * // Error toast with contact link
 * toastWithAction({
 *   message: 'You have reached your quota limit',
 *   actionText: 'Contact us',
 *   actionHref: contactEmailLink,
 *   variant: 'error',
 * });
 *
 * // Success toast with custom action
 * toastWithAction({
 *   message: 'Update available',
 *   actionText: 'Download',
 *   actionHref: '/downloads',
 *   variant: 'success',
 * });
 * ```
 */
export const toastWithAction = (props: ToastWithActionProps) => {
  toast.custom(() => <ToastWithAction {...props} />);
};
