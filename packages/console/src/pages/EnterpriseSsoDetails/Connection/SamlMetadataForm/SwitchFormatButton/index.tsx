import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import SwitchArrowIcon from '@/assets/icons/switch-arrow.svg';
import Tick from '@/assets/icons/tick.svg';
import ActionMenu from '@/ds-components/ActionMenu';
import { DropdownItem } from '@/ds-components/Dropdown';
import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  readonly value: FormFormat;
  readonly onChange: (formFormat: FormFormat) => void;
};

export enum FormFormat {
  Url = 'url',
  Xml = 'xml',
  Manual = 'manual',
}

type Options = {
  value: FormFormat;
  title: AdminConsoleKey;
};

const options: Options[] = [
  { value: FormFormat.Url, title: 'enterprise_sso.metadata.metadata_format_url' },
  { value: FormFormat.Xml, title: 'enterprise_sso.metadata.metadata_format_xml' },
  { value: FormFormat.Manual, title: 'enterprise_sso.metadata.metadata_format_manual' },
];

function SwitchFormatButton({ value, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <ActionMenu
      buttonProps={{
        type: 'text',
        size: 'small',
        title: 'enterprise_sso.metadata.dropdown_trigger_text',
        icon: <SwitchArrowIcon className={styles.dropdownIcon} />,
      }}
      dropdownHorizontalAlign="start"
      dropdownClassName={styles.dropdown}
      title={t('enterprise_sso.metadata.dropdown_title')}
    >
      {options.map(({ value: optionValue, title }) => (
        <DropdownItem
          key={optionValue}
          onClick={() => {
            onChange(optionValue);
          }}
        >
          <Tick className={classNames(styles.icon, value === optionValue && styles.selected)} />
          <div
            className={classNames(
              styles.title,
              styles.optionText,
              value === optionValue && styles.selected
            )}
          >
            <DynamicT forKey={title} />
          </div>
        </DropdownItem>
      ))}
    </ActionMenu>
  );
}

export default SwitchFormatButton;
