import { CompanySize, Project } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { reportOssSurvey } = await mockEsmWithActual('#src/libraries/oss-survey.js', () => ({
  reportOssSurvey: jest.fn(),
}));

const ossSurveyRoutes = await pickDefault(import('./index.js'));
const requester = createRequester({ anonymousRoutes: ossSurveyRoutes });

describe('ossSurveyRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 204 and relays a valid survey payload', async () => {
    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });

    expect(response.status).toBe(204);
    expect(reportOssSurvey).toHaveBeenCalledWith({
      emailAddress: 'dev@example.com',
      newsletter: true,
      project: Project.Company,
      companyName: 'Acme',
      companySize: CompanySize.Scale3,
    });
  });

  it('rejects invalid payloads before calling the reporter', async () => {
    const response = await requester.post('/oss-survey/report').send({
      emailAddress: 'not-an-email',
      project: Project.Personal,
    });

    expect(response.status).toBe(400);
    expect(reportOssSurvey).not.toHaveBeenCalled();
  });
});
