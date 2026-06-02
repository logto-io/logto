import {
  type ApplicationAccessControl,
  type Organization,
  RoleType,
  type Role,
  type User,
} from '@logto/schemas';

import Breakable from '@/components/Breakable';
import { UserItem } from '@/components/EntitiesTransfer/components/EntityItem';

import EntityRuleSelectorModal from './EntityRuleSelectorModal';
import OrganizationRoleRuleSelectorModal from './OrganizationRoleRuleSelectorModal';
import { RuleType } from './types';
import { type RuleEntities } from './use-rule-entities';

type Props = {
  readonly activeRuleType?: RuleType;
  readonly accessControl: ApplicationAccessControl;
  readonly ruleEntities: RuleEntities;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onUpdate: (accessControl: ApplicationAccessControl) => boolean;
};

function RuleSelectorModals({
  activeRuleType,
  accessControl,
  ruleEntities,
  isSubmitting,
  onClose,
  onUpdate,
}: Props) {
  return (
    <>
      <EntityRuleSelectorModal<User>
        isOpen={activeRuleType === RuleType.Users}
        title="application_details.access_control.rule_users"
        subtitle="application_details.access_control.rule_users_description"
        fieldTitle="application_details.access_control.rule_users"
        selectedEntities={ruleEntities.users}
        searchProps={{ pathname: 'api/users' }}
        emptyPlaceholder="errors.empty"
        isLoading={isSubmitting || ruleEntities.isLoading.users}
        renderEntity={(entity) => <UserItem entity={entity} />}
        onClose={onClose}
        onSubmit={async (entities) => {
          onUpdate({
            ...accessControl,
            userIds: entities.map(({ id }) => id),
          });
        }}
      />
      <EntityRuleSelectorModal<Role>
        isOpen={activeRuleType === RuleType.UserRoles}
        title="application_details.access_control.rule_user_roles"
        subtitle="application_details.access_control.rule_user_roles_description"
        fieldTitle="application_details.access_control.rule_user_roles"
        selectedEntities={ruleEntities.userRoles}
        searchProps={{ pathname: 'api/roles', parameters: { type: RoleType.User } }}
        emptyPlaceholder="errors.empty"
        isLoading={isSubmitting || ruleEntities.isLoading.userRoles}
        renderEntity={({ name }) => <Breakable>{name}</Breakable>}
        onClose={onClose}
        onSubmit={async (entities) => {
          onUpdate({
            ...accessControl,
            userRoleIds: entities.map(({ id }) => id),
          });
        }}
      />
      <EntityRuleSelectorModal<Organization>
        isOpen={activeRuleType === RuleType.Organizations}
        title="application_details.access_control.rule_organizations"
        subtitle="application_details.access_control.rule_organizations_description"
        fieldTitle="application_details.access_control.rule_organizations"
        selectedEntities={ruleEntities.organizations}
        searchProps={{ pathname: 'api/organizations' }}
        emptyPlaceholder="errors.empty"
        isLoading={isSubmitting || ruleEntities.isLoading.organizations}
        renderEntity={({ name }) => <Breakable>{name}</Breakable>}
        onClose={onClose}
        onSubmit={async (entities) => {
          onUpdate({
            ...accessControl,
            organizationIds: entities.map(({ id }) => id),
          });
        }}
      />
      <OrganizationRoleRuleSelectorModal
        isOpen={activeRuleType === RuleType.OrganizationRoles}
        selectedRules={accessControl.organizationRoleRules}
        selectedOrganizations={ruleEntities.organizationRoleRuleOrganizations}
        selectedOrganizationRoles={ruleEntities.organizationRoleRules}
        isLoading={isSubmitting || ruleEntities.isLoading.organizationRoleRules}
        onClose={onClose}
        onSubmit={async (organizationRoleRules) => {
          onUpdate({
            ...accessControl,
            organizationRoleRules,
          });
        }}
      />
    </>
  );
}

export default RuleSelectorModals;
