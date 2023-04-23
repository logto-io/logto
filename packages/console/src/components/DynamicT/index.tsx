import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

type Props = {
  forKey: AdminConsoleKey;
};

/**
 * A component to render a dynamic translation key.
 * Since `ReactNode` does not include vanilla objects while `JSX.Element` does. It's strange but no better way for now.
 *
 * @see https://github.com/i18next/i18next/issues/1852
 */
export default function DynamicT({ forKey }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return <>{t(forKey)}</>;
}
