import { RoleType, type Organization, type OrganizationRole } from '@logto/schemas';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import DataTransferBox from '@/ds-components/DataTransferBox';
import { type DataGroup, type SelectedDataEntry } from '@/ds-components/DataTransferBox/type';
import InlineNotification from '@/ds-components/InlineNotification';
import type { RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import RuleSelectorModal from './RuleSelectorModal';
import {
  buildOrganizationRoleRuleId,
  getOrganizationRoleRuleDisplayName,
  toOrganizationRoleRules,
} from './utils';

type OrganizationRoleRuleEntry = {
  id: string;
  name: string;
  displayName: string;
  organizationId: string;
  organizationRoleId: string;
};

type Props = {
  readonly isOpen: boolean;
  readonly selectedRules: Array<{
    organizationId: string;
    organizationRoleIds: string[];
  }>;
  readonly selectedOrganizations: Organization[];
  readonly selectedOrganizationRoles: OrganizationRole[];
  readonly isLoading: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    rules: Array<{
      organizationId: string;
      organizationRoleIds: string[];
    }>
  ) => Promise<void>;
};

const maxPageSize = 100;

const toOrganizationRoleRuleEntry = (
  organization: Organization,
  organizationRole: OrganizationRole
): OrganizationRoleRuleEntry => ({
  id: buildOrganizationRoleRuleId(organization.id, organizationRole.id),
  name: organizationRole.name,
  displayName: getOrganizationRoleRuleDisplayName(organization.name, organizationRole.name),
  organizationId: organization.id,
  organizationRoleId: organizationRole.id,
});

function OrganizationRoleRuleSelectorModal({
  isOpen,
  selectedRules,
  selectedOrganizations,
  selectedOrganizationRoles,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [selectedData, setSelectedData] = useState<
    Array<SelectedDataEntry<OrganizationRoleRuleEntry>>
  >([]);

  const { data: organizationsResponse, error: organizationsError } = useSWR<
    [Organization[], number],
    RequestError
  >(isOpen && buildUrl('api/organizations', { page: '1', page_size: String(maxPageSize) }));
  const { data: organizationRolesResponse, error: organizationRolesError } = useSWR<
    [OrganizationRole[], number],
    RequestError
  >(isOpen && buildUrl('api/organization-roles', { page: '1', page_size: String(maxPageSize) }));

  const [organizations = []] = organizationsResponse ?? [];
  const [organizationRoles = []] = organizationRolesResponse ?? [];

  const organizationRoleRuleEntries = useMemo(() => {
    const organizationsById = new Map(selectedOrganizations.map((entity) => [entity.id, entity]));
    const organizationRolesById = new Map(
      selectedOrganizationRoles.map((entity) => [entity.id, entity])
    );

    return selectedRules.flatMap(({ organizationId, organizationRoleIds }) => {
      const organization = organizationsById.get(organizationId);

      if (!organization) {
        return [];
      }

      return organizationRoleIds.flatMap((organizationRoleId) => {
        const organizationRole = organizationRolesById.get(organizationRoleId);

        return organizationRole
          ? [toOrganizationRoleRuleEntry(organization, organizationRole)]
          : [];
      });
    });
  }, [selectedOrganizationRoles, selectedOrganizations, selectedRules]);

  useEffect(() => {
    if (isOpen) {
      setSelectedData(organizationRoleRuleEntries);
    }
  }, [isOpen, organizationRoleRuleEntries]);

  const availableDataGroups: Array<DataGroup<OrganizationRoleRuleEntry>> = useMemo(() => {
    const userOrganizationRoles = organizationRoles.filter(({ type }) => type === RoleType.User);

    return organizations.map((organization) => ({
      groupId: organization.id,
      groupName: organization.name,
      dataList: userOrganizationRoles.map((organizationRole) =>
        toOrganizationRoleRuleEntry(organization, organizationRole)
      ),
    }));
  }, [organizationRoles, organizations]);

  const hasOrganizationRoleOptionsError = Boolean(organizationsError ?? organizationRolesError);
  const isOrganizationRoleOptionsLoading =
    isLoading ||
    (isOpen &&
      !hasOrganizationRoleOptionsError &&
      (!organizationsResponse || !organizationRolesResponse));

  return (
    <RuleSelectorModal
      isOpen={isOpen}
      isLoading={isOrganizationRoleOptionsLoading}
      title="application_details.access_control.rule_organization_roles"
      subtitle="application_details.access_control.rule_organization_roles_description"
      onClose={onClose}
      onSubmit={async () => {
        if (hasOrganizationRoleOptionsError) {
          return;
        }

        await onSubmit(toOrganizationRoleRules(selectedData));
      }}
    >
      {hasOrganizationRoleOptionsError ? (
        <InlineNotification severity="error">
          {t('application_details.access_control.load_error')}
        </InlineNotification>
      ) : (
        <DataTransferBox
          title="application_details.access_control.rule_organization_roles"
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          availableDataGroups={availableDataGroups}
          getSelectedDataTitle={({ displayName }) => displayName}
        />
      )}
    </RuleSelectorModal>
  );
}

export default OrganizationRoleRuleSelectorModal;
