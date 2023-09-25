import { Sentinel, SentinelDecision } from '@logto/schemas';

export class MockSentinel extends Sentinel {
  override async reportActivity(activity: unknown) {
    return [SentinelDecision.Allowed, Date.now()] as const;
  }
}
