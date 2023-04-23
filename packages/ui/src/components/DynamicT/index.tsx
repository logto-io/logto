import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

type Props = {
  forKey?: TFuncKey;
};

/**
 * A component to render a dynamic translation key.
 * Since `ReactNode` does not include vanilla objects while `JSX.Element` does. It's strange but no better way for now.
 *
 * @see https://github.com/i18next/i18next/issues/1852
 */
const DynamicT = ({ forKey }: Props) => {
  const { t } = useTranslation();

  if (!forKey) {
    return null;
  }

  return <>{t(forKey)}</>;
};
export default DynamicT;
