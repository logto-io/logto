import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

type Props = {
  forKey: AdminConsoleKey;
  interpolation?: Record<string, unknown>;
};

/**
 * A component to render a dynamic translation key.
 * Since `ReactNode` does not include vanilla objects while `JSX.Element` does. It's strange but no better way for now.
 *
 * @see https://github.com/i18next/i18next/issues/1852
 */
export default function DynamicT({ forKey, interpolation }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const translated = t(forKey, interpolation ?? {});

  if (typeof translated === 'string') {
    // The fragment will ensure the component has the return type that is compatible with `JSX.Element`.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{translated}</>;
  }

  // The fragment will ensure the component has the return type that is compatible with `JSX.Element`.
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{`Translation key ${forKey} is invalid.`}</>; // This would be great to have i18n as well. Not harmful for now.
}
