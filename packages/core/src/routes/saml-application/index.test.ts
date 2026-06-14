import {
  ApplicationType,
  BindingType,
  createDefaultApplicationAccessControl,
  NameIdFormat,
  type ApplicationAccessControl,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockApplication } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const mockSamlApplication = {
  ...mockApplication,
  type: ApplicationType.SAML,
  entityId: 'sp-entity-id',
  acsUrl: {
    binding: BindingType.Post,
    url: 'https://example.com/acs',
  },
  attributeMapping: {},
  encryption: {},
  nameIdFormat: NameIdFormat.Persistent,
};

const updateSamlApplicationById = jest.fn(async (_, data) => ({
  ...mockSamlApplication,
  ...data,
}));
const findApplicationAccessControl = jest.fn(async () => createDefaultApplicationAccessControl());

const tenantContext = new MockTenant(
  undefined,
  {
    applicationAccessControl: {
      findApplicationAccessControl,
    },
  },
  undefined,
  {
    samlApplications: {
      updateSamlApplicationById,
    },
  }
);

const { createRequester } = await import('#src/utils/test-utils.js');
const samlApplicationRoutes = await pickDefault(import('./index.js'));
const createSamlApplicationRequest = () =>
  createRequester({ authedRoutes: samlApplicationRoutes, tenantContext });

const buildAccessControl = (
  patch: Partial<ApplicationAccessControl> = {}
): ApplicationAccessControl => ({
  userIds: ['user-1'],
  userRoleIds: [],
  organizationIds: [],
  organizationRoleRules: [],
  ...patch,
});

describe('SAML application route', () => {
  afterEach(() => {
    updateSamlApplicationById.mockClear();
    findApplicationAccessControl.mockClear();
  });

  it('PATCH /saml-applications/:id should update app-level access control enablement', async () => {
    const samlApplicationRequest = createSamlApplicationRequest();
    findApplicationAccessControl.mockResolvedValueOnce(buildAccessControl());

    const response = await samlApplicationRequest
      .patch('/saml-applications/foo')
      .send({ appLevelAccessControlEnabled: true });

    expect(response.status).toEqual(200);
    expect(findApplicationAccessControl).toHaveBeenCalledWith('foo');
    expect(updateSamlApplicationById).toHaveBeenCalledWith('foo', {
      appLevelAccessControlEnabled: true,
    });
    expect(response.body.appLevelAccessControlEnabled).toEqual(true);
  });

  it('PATCH /saml-applications/:id should reject enabling app-level access control with empty rules', async () => {
    const samlApplicationRequest = createSamlApplicationRequest();

    const response = await samlApplicationRequest
      .patch('/saml-applications/foo')
      .send({ appLevelAccessControlEnabled: true });

    expect(response.status).toEqual(422);
    expect(updateSamlApplicationById).not.toHaveBeenCalled();
  });
});
