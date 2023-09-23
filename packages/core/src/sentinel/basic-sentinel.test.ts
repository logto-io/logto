import {
  type ActivityReport,
  SentinelActionResult,
  SentinelActivityAction,
  SentinelActivityTargetType,
  SentinelDecision,
} from '@logto/schemas';
import { addMinutes } from 'date-fns';

import { createMockCommonQueryMethods, expectSqlString } from '#src/test-utils/query.js';

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

const methods = createMockCommonQueryMethods();
const sentinel = new TestSentinel(methods);
const mockedTime = new Date('2021-01-01T00:00:00.000Z').valueOf();
const mockedBlockedTime = addMinutes(mockedTime, 10).valueOf();

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(mockedTime);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BasicSentinel -> reportActivity()', () => {
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
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: mockedBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.reportActivity(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedBlockedTime]);
    expect(methods.query).toHaveBeenCalledTimes(1);
    expect(methods.query).toHaveBeenCalledWith(
      expectSqlString('insert into "sentinel_activities"')
    );
  });
});

describe('BasicSentinel -> decide()', () => {
  it('should return existing blocked time if the activity is blocked', async () => {
    const existingBlockedTime = addMinutes(mockedTime, 5).valueOf();
    methods.maybeOne.mockResolvedValueOnce({ decisionExpiresAt: existingBlockedTime });

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, existingBlockedTime]);
  });

  it('should return allowed if the activity is not blocked and there are less than 5 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(4);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Allowed, mockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 5 failed attempts', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(5);

    const activity = createMockActivityReport();
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedBlockedTime]);
  });

  it('should return blocked if the activity is not blocked and there are 4 failed attempts and the current activity is failed', async () => {
    methods.maybeOne.mockResolvedValueOnce(null);
    methods.oneFirst.mockResolvedValueOnce(4);

    const activity = createMockActivityReport();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    activity.actionResult = SentinelActionResult.Failed;
    const decision = await sentinel.decide(activity);
    expect(decision).toEqual([SentinelDecision.Blocked, mockedBlockedTime]);
  });
});
