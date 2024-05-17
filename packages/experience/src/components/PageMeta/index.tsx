import { type TFuncKey } from 'i18next';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

type Props = {
  readonly titleKey: TFuncKey;
  readonly titleKeyInterpolation?: Record<string, unknown>;
};

const PageMeta = ({ titleKey, titleKeyInterpolation = {} }: Props) => {
  const { t } = useTranslation();
  const title = t(titleKey, titleKeyInterpolation);

  return <Helmet title={String(title)} />;
};

export default PageMeta;
