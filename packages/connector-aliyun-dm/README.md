### Aliyun direct mail connector

Aliyun is a primary cloud service provider in Asia, offering many cloud services, including DM (direct mail). Aliyun DM Connector is a plugin provided by the Logto team to call the Aliyun DM service APIs, with the help of which Logto end-users can register and sign in to their Logto account via mail verification code (or in other words, passcode).

## Register Aliyun account

Go to the [Aliyun website](https://cn.aliyun.com/) and register your Aliyun account if you don't have one.

## Enable and configure Aliyun Direct Mail

Go to the [DM service console page](https://www.aliyun.com/product/directmail) and sign in. Enable the Direct Mail service by clicking the _Apply to enable_ button on the top left of the page and begin the configuration process.

Starting from the [DM admin console page](https://dm.console.aliyun.com/), you should:
1. Go to _Email Domains_ from the sidebar and add _New Domain_ following the instructions.
2. Customize _Sender Addresses_ and _Email Tags_ respectively.

After finishing setup, there are two different ways to test:
- Go to the [DirectMail Overview page](https://dm.console.aliyun.com/), find _Operation Guide_ at the bottom of the page, and click on _Send Emails_. You will find all the different kinds of testing methods.
- Follow the path _Send Emails_ -> _Email Tasks_ in the sidebar to create a testing task.

## Compose the connector JSON

1. From the [DM admin console page](https://dm.console.aliyun.com/), hover on your avatar in the top right corner and go to "AccessKey Management", and click "Create AccessKey". You will get an "AccessKey ID" and "AccessKey Secret" pair after finishing security verification. Please keep them properly.
2. Go to the **Sender Addresses** or **Email Tags** tab you just visited from the [DM admin console page](https://dm.console.aliyun.com/), you can find "Sender Address" or "Email Tag" easily.
3. Fill out the Aliyun DM Connector settings:
    - Fill out the `accessKeyId` and `accessKeySecret` fields with access key pairs you've got from step 1.
    - Fill out the `accountName` and `fromAlias` field with "Sender Address" and "Email Tag" which were found in step 2. All templates will share this signature name.
    - You can add multiple DM connector templates for different cases. Here is an example of adding a single template:
        - Fill out the `subject` field, which will work as title of the sending email.
        - Fill out the `content` field with arbitrary string-type contents. Do not forget to leave `{{code}}` placeholder for random passcode.
        - Fill out `usageType` field with either `Register`, `SignIn` or `Test` for different use cases.

Here is an example of Aliyun DM connector config JSON.

```json
{
    "accessKeyId": "<your-access-key-id>",
    "accessKeySecret": "<your-access-key-secret>",
    "accountName": "<noreply@logto.io>",
    "fromAlias": "<logto>",
    "templates": [
        {
            "subject": "<register-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (regitser template)>",
            "usageType": "Register"
        },
        {
            "subject": "<sign-in-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (sign-in template)>",
            "usageType": "SignIn"
        },
        {
            "subject": "<test-template-subject>",
            "content": "<Logto: Your passcode is {{code}}. (test template)>",
            "usageType": "Test"
        },
    ]
}
```

### Config types

| Name            | Type       |
|-----------------|------------|
| accessKeyId     | string     |
| accessKeySecret | string     |
| accountName     | string     |
| fromAlias       | string     |
| templates       | Template[] |

| Template Properties | Type        | Enum values                      |
|---------------------|-------------|----------------------------------|
| subject             | string      | N/A                              |
| content             | string      | N/A                              |
| usageType           | enum string | 'Register' \| 'SignIn' \| 'Test' |
