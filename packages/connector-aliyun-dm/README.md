### Aliyun direct mail connector

Aliyun is a primary cloud service provider in Asia, offering many cloud services, including DM (direct mail). Aliyun DM Connector is a plugin provided by the Logto team to call the Aliyun DM service APIs, with the help of which Logto end-users can register and sign in to their Logto account via mail verification code (or in other words, passcode).

## Register Aliyun account

Go to the [Aliyun website](https://cn.aliyun.com/) and register your Aliyun account if you don't have one.

## Enable and Configure Aliyun Direct Mail

1. Sign-in with your Aliyun account at the [Aliyun website](https://cn.aliyun.com/) and go to the [DM service console page](https://www.aliyun.com/product/directmail).
2. Click the "Apply to enable" button on the top left of the DM service page and begin the configuration process.
3. After enabling the service, go back to the [DM admin console page](https://dm.console.aliyun.com/).
4. Go to **Email Domains** in the sidebar and add **New Domain** following the instructions.
5. Customize **Sender Addresses** and **Email Tags** respectively which can be found in the [DM admin console page](https://dm.console.aliyun.com/) sidebar.
6. After finishing settings, you can go to either the **Overview** tab and find all the different ways of testing at the bottom of the page or the **Email Tasks** tab to create a testing task.

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
