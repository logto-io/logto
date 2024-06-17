# AWS direct mail connector

The official Logto connector for AWS connector for direct mail service.

- [AWS direct mail connector](#aws-direct-mail-connector)
  - [Get started](#get-started)
  - [Configure a mail service in the AWS service console](#configure-a-mail-service-in-the-aws-service-console)
    - [Register AWS account](#register-aws-account)
    - [Create a identity](#create-a-identity)
    - [Configuration of the connector](#configuration-of-the-connector)
    - [Test the Amazon SES connector](#test-the-amazon-ses-connector)
    - [Configure types](#configure-types)

## Get started
Amazon SES is a cloud email service provider that can integrate into any application for bulk email sending.

Logto team to call the Amazon Simple Email Service APIs, with the help of which Logto end-users can register and sign in to their Logto account via mail verification code.

## Configure a mail service in the AWS service console

> 💡 **Tip**
> 
> You can skip some sections if you have already finished.

### Register AWS account

Go to [AWS](https://aws.amazon.com/) and register an account.

### Create a identity

- Go to `Amazon Simple Email Service` Console
- Create an identity, choose one of the following options
  - Create an domain
  - Create an email address


### Configuration of the connector

1. Click your username in the upper right corner of the Amazon console to enter `Security Credentials`. If you don't have one, create an `AccessKey` and save it carefully.
2. Complete the settings of the `Amazon Simple Email Service` connector:
   - Use the `AccessKey ID` and `AccessKey Secret` obtained in step 1 to fill in `accessKeyId` and `accessKeySecret` respectively.
   - `region`: Fill in the `region` field with the region of the identity you use to send mail.
   - `emailAddress`: The email address you use to send mail, in the format of `Logto<noreply@logto.io>` or `<noreply@logto.io>`

the following parameters are optional; parameters description can be found in the [AWS SES API documentation](https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html).

- `feedbackForwardingEmailAddress`
- `feedbackForwardingEmailAddressIdentityArn`
- `configurationSetName`

### Test the Amazon SES connector

You can type in an email address and click on "Send" to see whether the settings work before "Save and Done".

That's it. Don't forget to [Enable connector in sign-in experience](https://docs.logto.io/docs/recipes/configure-connectors/email-connector/enable-email-sign-in/).

### Configure types

| Name                                      | Type              |
| ----------------------------------------- | ----------------- |
| accessKeyId                               | string            |
| accessKeySecret                           | string            |
| region                                    | string            |
| emailAddress                              | string (OPTIONAL) |
| emailAddressIdentityArn                   | string (OPTIONAL) |
| feedbackForwardingEmailAddress            | string (OPTIONAL) |
| feedbackForwardingEmailAddressIdentityArn | string (OPTIONAL) |
| configurationSetName                      | string (OPTIONAL) |
| templates                                 | Template[]        |

| Template Properties | Type        | Enum values                                          |
| ------------------- | ----------- | -----------------------------------------------------|
| subject             | string      | N/A                                                  |
| content             | string      | N/A                                                  |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'ForgotPassword' \| 'Generic' |
