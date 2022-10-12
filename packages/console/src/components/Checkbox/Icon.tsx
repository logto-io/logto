import { AppearanceMode } from '@logto/schemas';

import CheckBoxSelectedDisabledDark from '@/assets/images/check-box-selected-disabled-dark.svg';
import CheckBoxSelectedDisabled from '@/assets/images/check-box-selected-disabled.svg';
import CheckBoxSelected from '@/assets/images/check-box-selected.svg';
import CheckBoxUnselectedDark from '@/assets/images/check-box-unselected-dark.svg';
import CheckBoxUnselectedDisabledDark from '@/assets/images/check-box-unselected-disabled-dark.svg';
import CheckBoxUnselectedDisabled from '@/assets/images/check-box-unselected-disabled.svg';
import CheckBoxUnselected from '@/assets/images/check-box-unselected.svg';
import { useTheme } from '@/hooks/use-theme';

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
