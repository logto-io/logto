import {
  type ActivityReport,
  SentinelActionResult,
  SentinelActivityAction,
  SentinelActivityTargetType,
  SentinelDecision,
} from '@logto/schemas';
import { addMinutes } from 'date-fns';

import { createMockCommonQueryMethods, expectSqlString } from '#src/test-utils/query.js';

import { mockSignInExperience } from '../__mocks__/sign-in-experience.js';
import { MockQueries } from '../test-utils/tenant.js';

import BasicSentinel from './basic-sentinel.js';

const { jest } = import.meta;

const createMockActivityReport = (): ActivityReport => ({
  targetType: SentinelActivityTargetType.User,
  targetHash: 'baz',
  action: SentinelActivityAction.Password,
  actionResult: SentinelActionResult.Success,
  payload: {},
});

class TestSentinel extends BasicSentinel {
  override decide = super.decide;
}

const findDefaultSignInExperienceMock = jest.fn();

const methods = createMockCommonQueryMethods();
const sentinel = new TestSentinel(
  methods,
  new MockQueries({
    signInExperiences: {
      findDefaultSignInExperience: findDefaultSignInExperienceMock,
    },
  })
);
const mockedTime = new Date('2021-01-01T00:00:00.000Z').valueOf();
const mockedDefaultBlockedTime = addMinutes(mockedTime, 60).valueOf();

const customSentinelPolicy = {
  maxAttempts: 7,
  lockoutDuration: 15,
};

const mockedCustomBlockedTime = addMinutes(
  mockedTime,
  customSentinelPolicy.lockoutDuration
).valueOf();

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(mockedTime);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BasicSentinel -> reportActivity()', () => {
  beforeEach(() => {
    findDefaultSignInExperienceMock.mockResolvedValue(mockSignInExperience);
  });

  it('should insert an activity', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(0);

    const activity = createMockActivityReport();
    const decision = await sentinel.reportActivity(activity);

    expect(decision).toStrictEqual([SentinelDecision.Allowed, mockedTime]);
    expect(methods.query).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(
      expectSqlString('insert into "sentinel_activities"')
    );
  });

  it('should insert a blocked activity', async () => {
    // Mock the query method to return a blocked activity
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: mockedDefaultBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.reportActivity(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedDefaultBlockedTime]);
    expect(methods.query).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(
      expectSqlString('insert into "sentinel_activities"')
    );
  });
});

describe('BasicSentinel -> decide()', () => {
  beforeEach(() => {
    findDefaultSignInExperienceMock.mockResolvedValue(mockSignInExperience);
  });

  it('should return existing blocked time if the activity is blocked', async () => {
    const existingBlockedTime = addMinutes(mockedTime, 5).valueOf();
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: existingBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, existingBlockedTime]);
  });

  it('should return allowed if the activity is not blocked and there are less than 100 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(99);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Allowed, mockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 100 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(100);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedDefaultBlockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 99 failed attempts and the current activity is failed', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(99);

    const activity = createMockActivityReport();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    activity.actionResult = SentinelActionResult.Failed;
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedDefaultBlockedTime]);
  });
});

describe('BasicSentinel -> action pools', () => {
  beforeEach(() => {
    findDefaultSignInExperienceMock.mockResolvedValue(mockSignInExperience);
  });

  it('should use the pooled actions for password decisions', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(0);

    const activity = createMockActivityReport();

    await sentinel.decide(activity);

    const blockedQuery: unknown = methods.maybeOne.mock.calls[0]?.[0];
    const failedAttemptsQuery: unknown = methods.oneFirst.mock.calls[0]?.[0];

    expect(blockedQuery).toHaveProperty(
      'values',
      expect.arrayContaining([expect.arrayContaining([...BasicSentinel.pooledActions])])
    );
    expect(failedAttemptsQuery).toHaveProperty(
      'values',
      expect.arrayContaining([expect.arrayContaining([...BasicSentinel.pooledActions])])
    );
  });

  it('should use a dedicated pool for MFA decisions', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(0);

    const activity = createMockActivityReport();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    activity.action = SentinelActivityAction.Mfa;

    await sentinel.decide(activity);

    const blockedQuery: unknown = methods.maybeOne.mock.calls[0]?.[0];
    const failedAttemptsQuery: unknown = methods.oneFirst.mock.calls[0]?.[0];

    expect(blockedQuery).toHaveProperty(
      'values',
      expect.arrayContaining([expect.arrayContaining([SentinelActivityAction.Mfa])])
    );
    expect(failedAttemptsQuery).toHaveProperty(
      'values',
      expect.arrayContaining([expect.arrayContaining([SentinelActivityAction.Mfa])])
    );
  });
});

describe('BasicSentinel with custom policy', () => {
  beforeEach(() => {
    findDefaultSignInExperienceMock.mockResolvedValue({
      ...mockSignInExperience,
      sentinelPolicy: customSentinelPolicy,
    });
  });

  it('should insert an activity', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(0);

    const activity = createMockActivityReport();
    const decision = await sentinel.reportActivity(activity);

    expect(decision).toStrictEqual([SentinelDecision.Allowed, mockedTime]);
    expect(methods.query).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(
      expectSqlString('insert into "sentinel_activities"')
    );
  });

  it('should insert a blocked activity', async () => {
    // Mock the query method to return a blocked activity
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: mockedCustomBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.reportActivity(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedCustomBlockedTime]);
    expect(methods.query).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(
      expectSqlString('insert into "sentinel_activities"')
    );
  });

  it('should return existing blocked time if the activity is blocked', async () => {
    const existingBlockedTime = addMinutes(mockedTime, 5).valueOf();
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: existingBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, existingBlockedTime]);
  });

  it('should return allowed if the activity is not blocked and there are less than 7 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(6);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Allowed, mockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 7 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(7);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedCustomBlockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 4 failed attempts and the current activity is failed', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(6);

    const activity = createMockActivityReport();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    activity.actionResult = SentinelActionResult.Failed;
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedCustomBlockedTime]);
  });
});
