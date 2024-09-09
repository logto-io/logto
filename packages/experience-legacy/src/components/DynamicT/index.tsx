import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

type Props = {
  readonly forKey?: TFuncKey;
  readonly interpolation?: Record<string, unknown>;
};

/**
 * A component to render a dynamic translation key.
 */
const DynamicT = ({ forKey, interpolation }: Props) => {
  const { t } = useTranslation();

  if (!forKey) {
    return null;
  }

  const translated = t(forKey, interpolation ?? {});

  if (typeof translated === 'string') {
    // The fragment will ensure the component has the return type that is compatible with `JSX.Element`.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{translated}</>;
  }

  // The fragment will ensure the component has the return type that is compatible with `JSX.Element`.
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{`Translation key ${forKey} is invalid.`}</>; // This would be great to have i18n as well. Not harmful for now.
};
export default DynamicT;
