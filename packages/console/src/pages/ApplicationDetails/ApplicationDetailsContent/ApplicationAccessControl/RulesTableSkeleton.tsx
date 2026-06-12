import { type ApplicationAccessControl } from '@logto/schemas';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';
import { hasApplicationAccessControlRules } from './utils';

type RuleTableSkeletonGroup = {
  key: string;
  title: string;
  description: string;
  rowCount: number;
  rowType: 'user' | 'assignedEntities';
};

type Props = {
  readonly accessControl?: ApplicationAccessControl;
};

const getOrganizationRoleRuleCount = ({ organizationRoleRules }: ApplicationAccessControl) =>
  organizationRoleRules.reduce(
    (count, { organizationRoleIds }) => count + organizationRoleIds.length,
    0
  );

function SkeletonAssignedEntities() {
  return (
    <div className={styles.ruleSkeletonAssignedEntities}>
      <div className={styles.ruleSkeletonAvatars}>
        <div className={styles.ruleSkeletonAvatar} />
        <div className={styles.ruleSkeletonAvatar} />
        <div className={styles.ruleSkeletonAvatar} />
      </div>
      <div className={styles.ruleSkeletonCount} />
    </div>
  );
}

function RulesTableSkeleton({ accessControl }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (accessControl && !hasApplicationAccessControlRules(accessControl)) {
    return null;
  }

  const groups = accessControl
    ? (
        [
          {
            key: 'users',
            title: t('application_details.access_control.rule_users'),
            description: t('application_details.access_control.rule_table_user_id'),
            rowCount: accessControl.userIds.length,
            rowType: 'user',
          },
          {
            key: 'userRoles',
            title: t('application_details.access_control.rule_roles'),
            description: t('application_details.access_control.rule_table_users'),
            rowCount: accessControl.userRoleIds.length,
            rowType: 'assignedEntities',
          },
          {
            key: 'organizations',
            title: t('application_details.access_control.rule_organizations'),
            description: t('application_details.access_control.rule_table_members'),
            rowCount: accessControl.organizationIds.length,
            rowType: 'assignedEntities',
          },
          {
            key: 'organizationRoles',
            title: t('application_details.access_control.rule_organization_roles'),
            description: t('application_details.access_control.rule_table_members'),
            rowCount: getOrganizationRoleRuleCount(accessControl),
            rowType: 'assignedEntities',
          },
        ] satisfies RuleTableSkeletonGroup[]
      ).filter(({ rowCount }) => rowCount > 0)
    : ([
        {
          key: 'placeholder',
          title: '',
          description: '',
          rowCount: 3,
          rowType: 'assignedEntities',
        },
      ] satisfies RuleTableSkeletonGroup[]);

  return (
    <table className={styles.rulesTable}>
      <thead>
        <tr>
          <th>{t('application_details.access_control.rule_table_rules')}</th>
          <th>{t('application_details.access_control.rule_table_description')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {groups.map(({ key, title, description, rowCount, rowType }) => (
          <Fragment key={key}>
            <tr className={styles.ruleGroupRow}>
              <td>{accessControl ? title : <div className={styles.ruleSkeletonGroupTitle} />}</td>
              <td>
                {accessControl ? (
                  description
                ) : (
                  <div className={styles.ruleSkeletonGroupDescription} />
                )}
              </td>
              <td />
            </tr>
            {Array.from({ length: rowCount }, (_, index) => index + 1).map((rowNumber) => (
              <tr key={`${key}-row-${rowNumber}`}>
                <td>
                  <div className={styles.ruleSkeletonName}>
                    {rowType === 'user' && <div className={styles.ruleSkeletonUserAvatar} />}
                    <div className={styles.ruleSkeletonTitle} />
                  </div>
                </td>
                <td>
                  {rowType === 'user' ? (
                    <div className={styles.ruleSkeletonUserId} />
                  ) : (
                    <SkeletonAssignedEntities />
                  )}
                </td>
                <td className={styles.ruleDelete}>
                  <div className={styles.ruleSkeletonDelete} />
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default RulesTableSkeleton;
