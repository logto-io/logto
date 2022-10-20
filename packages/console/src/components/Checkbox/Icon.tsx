import { AppearanceMode } from '@logto/schemas';

import { useTheme } from '@/hooks/use-theme';
import CheckBoxSelected from '@/icons/CheckBoxSelected';
import CheckBoxSelectedDisabled from '@/icons/CheckBoxSelectedDisabled';
import CheckBoxSelectedDisabledDark from '@/icons/CheckBoxSelectedDisabledDark';
import CheckBoxUnselected from '@/icons/CheckBoxUnselected';
import CheckBoxUnselectedDark from '@/icons/CheckBoxUnselectedDark';
import CheckBoxUnselectedDisabled from '@/icons/CheckBoxUnselectedDisabled';
import CheckBoxUnselectedDisabledDark from '@/icons/CheckBoxUnselectedDisabledDark';

type Props = {
  className?: string;
};

const Icon = ({ className }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  return (
    <span className={className}>
      <CheckBoxSelected />
      {isLightMode ? <CheckBoxUnselected /> : <CheckBoxUnselectedDark />}
      {isLightMode ? <CheckBoxSelectedDisabled /> : <CheckBoxSelectedDisabledDark />}
      {isLightMode ? <CheckBoxUnselectedDisabled /> : <CheckBoxUnselectedDisabledDark />}
    </span>
  );
};

export default Icon;
