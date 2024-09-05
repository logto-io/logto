import { type AdminConsoleKey } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import {
  type ReactNode,
  type ReactElement,
  cloneElement,
  isValidElement,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import More from '@/assets/icons/more.svg?react';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { type Props as DropdownItemProps } from '@/ds-components/Dropdown/DropdownItem';
import DynamicT from '@/ds-components/DynamicT';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import useWindowResize from '@/hooks/use-window-resize';

import styles from './index.module.scss';

type StatusTag = {
  status: TagProps['status'];
  text: AdminConsoleKey;
};

type Identifier = {
  name: string;
  value: string;
};

type AdditionalActionButton = {
  title: AdminConsoleKey;
  icon: ReactNode;
  onClick: () => void;
};

export type MenuItem = {
  type?: DropdownItemProps['type'];
  title: AdminConsoleKey;
  icon: ReactNode;
  onClick: () => void;
};

type ResponsiveCustomElement = HTMLDivElement & {
  isCompact: boolean;
};

type Props = {
  /**
   * The main 60x60 icon on the very left
   */
  readonly icon: ReactElement<HTMLElement>;
  /**
   * The main title of the header
   */
  readonly title: ReactNode;
  /**
   * Shows a subtitle in the second row
   * Example usage: Secondary information of the user (if any) in user details page
   */
  readonly subtitle?: ReactNode;
  /**
   * Shows a tag in the second row of the header metadata
   * Example usage: Application type "Native / SPA / Traditional"
   */
  readonly primaryTag?: ReactNode;
  /**
   * Shows a status tag in the second row of the header metadata
   * Example usage: Connector status "In use / Not in use" in connector details page
   */
  readonly statusTag?: StatusTag;
  /**
   * Shows the entity identifier in a "Copy to clipboard" component
   * Example usage: "App ID" in application details page
   */
  readonly identifier?: Identifier;
  /**
   * Shows an additional action button in the header, next to the "...(More)" button
   * Example usage: "Check Guide" button in application details page
   */
  readonly additionalActionButton?: AdditionalActionButton;
  /**
   * Shows additional custom element in the header, next to the "...(More)" button
   * Example usage (special use case): "Total email sent (count)" in Logto email connector
   */
  readonly additionalCustomElement?: ReactElement<ResponsiveCustomElement>;
  /**
   * Dropdown action menu items nested in the "...(More)" button
   */
  readonly actionMenuItems?: MenuItem[];
};

function DetailsPageHeader({
  icon,
  title,
  subtitle,
  primaryTag,
  statusTag,
  identifier,
  additionalActionButton,
  additionalCustomElement,
  actionMenuItems,
}: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [showIcon, setShowIcon] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [showAdditionalCustomElement, setShowAdditionalCustomElement] = useState(true);
  const identifierRef = useRef<HTMLDivElement>(null);
  const operationRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.dir() === 'rtl';

  useWindowResize(() => {
    if (!identifierRef.current || !operationRef.current) {
      return;
    }

    // Dynamically handle the visibility of the icon and action button styles. Sources:
    // https://www.figma.com/file/hqAWH3Di8gkiV5TXAt6juO/%F0%9F%8C%B9-%5BAC%5D-Layout-UI-Optimization?type=design&node-id=896-75673
    const {
      left: identifierLeftEdge,
      right: identifierRightEdge,
      width: identifierWidth,
    } = identifierRef.current.getBoundingClientRect();

    const { left: operationLeftEdge, right: operationRightEdge } =
      operationRef.current.getBoundingClientRect();

    const identifierEdge = isRtl ? identifierLeftEdge : identifierRightEdge;
    const operationEdge = isRtl ? operationRightEdge : operationLeftEdge;

    // When the operation buttons are in regular form, and the gap between the operation area and the identifier copy box is
    // only 24px. This means the window is shrinking and reaching the 1st breakpoint. Set operation buttons to compact form.
    if (!isCompact && Math.abs(operationEdge - identifierEdge) <= 24) {
      setIsCompact(true);
    }

    // When the operation buttons are compact, and the gap between the operation area and the identifier copy box is only 24px.
    // This means the window keeps shrinking and reaching the 2nd breakpoint. Hide the main icon on the very left.
    if (isCompact && showIcon && Math.abs(operationEdge - identifierEdge) <= 24) {
      setShowIcon(false);
    }

    // When the identifier copy box is 50px, and the gap between the operation area and the identifier copy box is only 24px.
    // This is when the page header is extremely narrow and barely has space to hold the identifier. Hide the additional custom element.
    if (identifierWidth <= 50 && Math.abs(operationEdge - identifierEdge) <= 24) {
      setShowAdditionalCustomElement(false);
    }

    // When the gap between the operation buttons and the identifier copy box is greater than 80px, show the additional custom element.
    if (!showAdditionalCustomElement && Math.abs(operationEdge - identifierEdge) > 80) {
      setShowAdditionalCustomElement(true);
    }

    // When the operation buttons are compact, icon is hidden, and the operation area is 120px away from the identifier copy box.
    // This means the window is enlarging and there is enough room to hold the icon. Show the icon.
    // 120px is a bit greater than the space required to hold the icon (60px + 24px padding), in order to avoid jittering.
    if (isCompact && !showIcon && Math.abs(operationEdge - identifierEdge) > 120) {
      setShowIcon(true);
    }

    // When the operation buttons are compact, icon is visible, and the operation area is 240px away from the identifier copy box.
    // This means the window width keeps increasing, and there is enough room to hold the regular size operation buttons.
    // Set compact operation buttons to regular form. Also, 240px is a bit greater than the actual space required to hold the regular
    // form operation buttons (around 180 ~ 240px in various cases), and this is also to avoid jittering.
    if (
      isCompact &&
      showIcon &&
      Math.abs(operationEdge - identifierEdge) > (additionalCustomElement ? 240 : 180)
    ) {
      setIsCompact(false);
    }
  });

  return (
    <Card className={styles.header}>
      {showIcon && isValidElement(icon) && cloneElement(icon, { className: styles.icon })}
      <div className={styles.metadata}>
        <div className={styles.name}>{title}</div>
        <div className={styles.row}>
          {primaryTag && (
            <>
              {typeof primaryTag === 'string' ? <Tag>{primaryTag}</Tag> : primaryTag}
              <div className={styles.verticalBar} />
            </>
          )}
          {subtitle && (
            <>
              <div className={styles.text}>{subtitle}</div>
              <div className={styles.verticalBar} />
            </>
          )}
          {statusTag && (
            <>
              <Tag type="state" status={statusTag.status}>
                <DynamicT forKey={statusTag.text} />
              </Tag>
              <div className={styles.verticalBar} />
            </>
          )}
          {identifier && (
            <>
              <div className={styles.text}>{identifier.name}</div>
              <CopyToClipboard
                ref={identifierRef}
                className={styles.copyId}
                // It's OK to use `ch` here because the font is monospace. 40px is the copy icon + padding.
                style={{ maxWidth: `calc(${identifier.value.length}ch + 40px)` }}
                valueStyle={{ width: 0 }}
                size="small"
                value={identifier.value}
              />
            </>
          )}
        </div>
      </div>
      <div ref={operationRef} className={styles.operations}>
        {showAdditionalCustomElement &&
          isValidElement(additionalCustomElement) &&
          cloneElement<ResponsiveCustomElement>(additionalCustomElement, { isCompact })}
        {additionalActionButton && (
          <Button
            icon={conditional(isCompact && additionalActionButton.icon)}
            title={conditional(!isCompact && additionalActionButton.title)}
            size="large"
            onClick={additionalActionButton.onClick}
          />
        )}
        {actionMenuItems && actionMenuItems.length > 0 && (
          <ActionMenu
            buttonProps={{ icon: <More />, size: 'large' }}
            title={t('general.more_options')}
          >
            {actionMenuItems.map(({ title, icon, type, onClick }) => (
              <ActionMenuItem key={title} icon={icon} type={type} onClick={onClick}>
                <DynamicT forKey={title} />
              </ActionMenuItem>
            ))}
          </ActionMenu>
        )}
      </div>
    </Card>
  );
}

export default DetailsPageHeader;
