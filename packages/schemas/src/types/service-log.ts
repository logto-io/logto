/**
 * Types of `service_logs` rows. The rows are written by the Logto Cloud service; some members
 * are cloud-only concepts kept here so every type shares this single definition.
 */
export enum ServiceLogType {
  SendEmail = 'sendEmail',
  SendSms = 'sendSms',
  /** Cloud-only: custom JWT worker invocations. */
  FetchCustomJwt = 'fetchCustomJwt',
  /**
   * Cloud-only: a hosted-email send that failed at the provider; the payload carries the
   * normalized provider error. Deliberately distinct from {@link ServiceLogType.SendEmail}:
   * usage counting matches on that exact type, so failed sends never count toward email usage.
   */
  SendEmailFailed = 'sendEmailFailed',
  /** Cloud-only: an Actions script run on the script runner. Mirrors the `runAction` entry. */
  RunAction = 'runAction',
}
