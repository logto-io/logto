import { CompanySize, Project } from '@logto/schemas';

const mockPayload = {
  emailAddress: 'dev@example.com',
  newsletter: true,
  project: Project.Company,
  companyName: 'Acme',
  companySize: CompanySize.Scale3,
} as const;

// Module-level mocks for env constants. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockIsDevFeaturesEnabled = true;
// eslint-disable-next-line @silverhand/fp/no-let
let mockOssSurveyEndpoint: string | undefined = 'https://survey.example.com';

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled;
  },
  get ossSurveyEndpoint() {
    return mockOssSurveyEndpoint;
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports, unicorn/prefer-module
const { reportOssSurvey } = require('./report-oss-survey') as typeof import('./report-oss-survey');

describe('reportOssSurvey', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });

  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockClear();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = true;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com';
  });

  it('sends a POST to the survey endpoint with the correct URL, headers, and body', () => {
    reportOssSurvey(mockPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload),
        keepalive: true,
      })
    );
  });

  it('constructs the correct URL when the endpoint has a trailing slash', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com/';
    reportOssSurvey(mockPayload);

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/surveys'),
      expect.anything()
    );
  });

  it('does not call fetch when isDevFeaturesEnabled is false', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockIsDevFeaturesEnabled = false;
    reportOssSurvey(mockPayload);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call fetch when ossSurveyEndpoint is undefined', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = undefined;
    reportOssSurvey(mockPayload);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not call fetch when ossSurveyEndpoint is invalid', () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'not a valid URL';
    reportOssSurvey(mockPayload);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows fetch failures', async () => {
    fetchMock.mockRejectedValue(new Error('network error'));

    expect(() => {
      reportOssSurvey(mockPayload);
    }).not.toThrow();

    // Allow the promise to settle so the rejection is handled
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });
});
