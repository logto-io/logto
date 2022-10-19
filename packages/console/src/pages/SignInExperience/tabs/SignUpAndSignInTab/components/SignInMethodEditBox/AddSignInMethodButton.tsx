import type { SignInIdentifier } from '@logto/schemas';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';

import Button from '@/components/Button';
import Dropdown, { DropdownItem } from '@/components/Dropdown';

type Props = {
  options: SignInIdentifier[];
  onSelected: (signInIdentifier: SignInIdentifier) => void;
};

// TODO: @yijun extract this component to share with the future add social button
const AddSignInMethodButton = ({ options, onSelected }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const candidates = options.map((identifier) => ({
    value: identifier,
    title: t('sign_in_exp.sign_up_and_sign_in.identifiers', { context: snakeCase(identifier) }),
  }));

  if (candidates.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={anchorRef}>
        <Button
          type="text"
          size="small"
          title="general.add_another"
          onClick={() => {
            setIsOpen(true);
          }}
        />
      </div>
      <Dropdown
        anchorRef={anchorRef}
        isOpen={isOpen}
        horizontalAlign="start"
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {candidates.map(({ value, title }) => (
          <DropdownItem
            key={value}
            onClick={() => {
              onSelected(value);
            }}
          >
            {title}
          </DropdownItem>
        ))}
      </Dropdown>
    </>
  );
};

export default AddSignInMethodButton;
