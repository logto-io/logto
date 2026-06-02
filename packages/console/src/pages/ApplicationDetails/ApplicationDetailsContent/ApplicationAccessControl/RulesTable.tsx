import { type ApplicationAccessControl, RoleType } from '@logto/schemas';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/icons/delete.svg?react';
import Breakable from '@/components/Breakable';
import ItemPreview from '@/components/ItemPreview';
import UserAvatar from '@/components/UserAvatar';
import ConfirmModal from '@/ds-components/ConfirmModal';
import IconButton from '@/ds-components/IconButton';
import AssignedEntities from '@/pages/Roles/components/AssignedEntities';

import styles from './index.module.scss';
import { type RuleEntities } from './use-rule-entities';
import {
  getOrganizationRoleRuleDisplayName,
  getUserDisplayName,
  hasApplicationAccessControlRules,
} from './utils';

const getOrganizationRoleDetailsPathname = (id: string) =>
  `/organization-template/organization-roles/${id}`;

type RuleTableRow = {
  id: string;
  name: ReactNode;
  description: ReactNode;
  onDelete: () => Promise<boolean>;
};

type RuleTableGroup = {
  key: string;
  title: string;
  description: string;
  rows: RuleTableRow[];
};

type Props = {
  readonly accessControl: ApplicationAccessControl;
  readonly ruleEntities: RuleEntities;
  readonly onChange: (accessControl: ApplicationAccessControl) => Promise<boolean>;
};

function RulesTable({ accessControl, ruleEntities, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [ruleToBeDeleted, setRuleToBeDeleted] = useState<RuleTableRow>();
  const [isDeletingRule, setIsDeletingRule] = useState(false);

  const handleDelete = async () => {
    if (!ruleToBeDeleted || isDeletingRule) {
      return;
    }

    setIsDeletingRule(true);

    try {
      const isDeleted = await ruleToBeDeleted.onDelete();

      if (isDeleted) {
        setRuleToBeDeleted(undefined);
      }
    } finally {
      setIsDeletingRule(false);
    }
  };

  const groups = useMemo<RuleTableGroup[]>(() => {
    const usersById = new Map(ruleEntities.users.map((user) => [user.id, user]));
    const userRolesById = new Map(ruleEntities.userRoles.map((role) => [role.id, role]));
    const organizationsById = new Map(
      ruleEntities.organizations.map((organization) => [organization.id, organization])
    );
    const organizationRuleOrganizationsById = new Map(
      ruleEntities.organizationRoleRuleOrganizations.map((organization) => [
        organization.id,
        organization,
      ])
    );
    const organizationRolesById = new Map(
      ruleEntities.organizationRoleRules.map((role) => [role.id, role])
    );

    return [
      {
        key: 'users',
        title: t('application_details.access_control.rule_users'),
        description: t('application_details.access_control.rule_table_user_id'),
        rows: accessControl.userIds.flatMap((userId) => {
          const user = usersById.get(userId);

          if (!user) {
            return [];
          }

          return [
            {
              id: userId,
              name: (
                <ItemPreview
                  title={getUserDisplayName(user)}
                  icon={<UserAvatar size="small" user={user} />}
                  to={`/users/${userId}`}
                />
              ),
              description: <Breakable>{user.id}</Breakable>,
              onDelete: async () =>
                onChange({
                  ...accessControl,
                  userIds: accessControl.userIds.filter((id) => id !== userId),
                }),
            },
          ];
        }),
      },
      {
        key: 'userRoles',
        title: t('application_details.access_control.rule_roles'),
        description: t('application_details.access_control.rule_table_users'),
        rows: accessControl.userRoleIds.flatMap((roleId) => {
          const role = userRolesById.get(roleId);

          if (!role) {
            return [];
          }

          return [
            {
              id: roleId,
              name: <ItemPreview title={role.name} to={`/roles/${roleId}`} />,
              description: (
                <AssignedEntities
                  type={RoleType.User}
                  entities={ruleEntities.roleUserPreviews[roleId]?.featuredUsers ?? []}
                  count={ruleEntities.roleUserPreviews[roleId]?.usersCount ?? 0}
                />
              ),
              onDelete: async () =>
                onChange({
                  ...accessControl,
                  userRoleIds: accessControl.userRoleIds.filter((id) => id !== roleId),
                }),
            },
          ];
        }),
      },
      {
        key: 'organizations',
        title: t('application_details.access_control.rule_organizations'),
        description: t('application_details.access_control.rule_table_members'),
        rows: accessControl.organizationIds.flatMap((organizationId) => {
          const organization = organizationsById.get(organizationId);

          if (!organization) {
            return [];
          }

          return [
            {
              id: organizationId,
              name: (
                <ItemPreview title={organization.name} to={`/organizations/${organizationId}`} />
              ),
              description: (
                <AssignedEntities
                  type={RoleType.User}
                  entities={
                    ruleEntities.organizationMembers[organizationId]?.users
                      .slice(0, 3)
                      .map(({ id, avatar, name }) => ({ id, avatar, name })) ?? []
                  }
                  count={ruleEntities.organizationMembers[organizationId]?.usersCount ?? 0}
                />
              ),
              onDelete: async () =>
                onChange({
                  ...accessControl,
                  organizationIds: accessControl.organizationIds.filter(
                    (id) => id !== organizationId
                  ),
                }),
            },
          ];
        }),
      },
      {
        key: 'organizationRoles',
        title: t('application_details.access_control.rule_organization_roles'),
        description: t('application_details.access_control.rule_table_members'),
        rows: accessControl.organizationRoleRules.flatMap(
          ({ organizationId, organizationRoleIds }) => {
            const organization = organizationRuleOrganizationsById.get(organizationId);

            if (!organization) {
              return [];
            }

            return organizationRoleIds.flatMap((organizationRoleId) => {
              const organizationRole = organizationRolesById.get(organizationRoleId);

              if (!organizationRole) {
                return [];
              }

              const organizationRoleUsers =
                ruleEntities.organizationMembers[organizationId]?.users.filter(
                  ({ organizationRoles }) =>
                    organizationRoles.some(({ id }) => id === organizationRoleId)
                ) ?? [];

              return [
                {
                  id: `${organizationId}:${organizationRoleId}`,
                  name: (
                    <ItemPreview
                      title={getOrganizationRoleRuleDisplayName(
                        organization.name,
                        organizationRole.name
                      )}
                      to={getOrganizationRoleDetailsPathname(organizationRoleId)}
                    />
                  ),
                  description: (
                    <AssignedEntities
                      type={RoleType.User}
                      entities={organizationRoleUsers
                        .slice(0, 3)
                        .map(({ id, avatar, name }) => ({ id, avatar, name }))}
                      count={organizationRoleUsers.length}
                    />
                  ),
                  onDelete: async () =>
                    onChange({
                      ...accessControl,
                      organizationRoleRules: accessControl.organizationRoleRules.flatMap((rule) => {
                        if (rule.organizationId !== organizationId) {
                          return [rule];
                        }

                        const nextOrganizationRoleIds = rule.organizationRoleIds.filter(
                          (id) => id !== organizationRoleId
                        );

                        return nextOrganizationRoleIds.length > 0
                          ? [{ ...rule, organizationRoleIds: nextOrganizationRoleIds }]
                          : [];
                      }),
                    }),
                },
              ];
            });
          }
        ),
      },
    ].filter(({ rows }) => rows.length > 0);
  }, [accessControl, onChange, ruleEntities, t]);

  if (!hasApplicationAccessControlRules(accessControl)) {
    return null;
  }

  return (
    <>
      <table className={styles.rulesTable}>
        <thead>
          <tr>
            <th>{t('application_details.access_control.rule_table_rules')}</th>
            <th>{t('application_details.access_control.rule_table_description')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {groups.map(({ key, title, description, rows }) => (
            <Fragment key={key}>
              <tr key={`${key}-header`} className={styles.ruleGroupRow}>
                <td>{title}</td>
                <td>{description}</td>
                <td />
              </tr>
              {rows.map((row) => {
                const { id, name, description } = row;

                return (
                  <tr key={id}>
                    <td className={styles.ruleName}>{name}</td>
                    <td>{description}</td>
                    <td className={styles.ruleDelete}>
                      <IconButton
                        size="small"
                        aria-label={t('general.remove')}
                        onClick={() => {
                          setRuleToBeDeleted(row);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        isOpen={Boolean(ruleToBeDeleted)}
        isLoading={isDeletingRule}
        confirmButtonText="general.remove"
        onCancel={() => {
          setRuleToBeDeleted(undefined);
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      >
        {t('application_details.access_control.delete_rule_confirmation')}
      </ConfirmModal>
    </>
  );
}

export default RulesTable;
