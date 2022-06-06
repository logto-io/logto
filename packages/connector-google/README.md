### Google
The Google connector provides a succinct way for your application to use Google’s OAuth 2.0 authentication system for users to login.

# Prerequisite

- A Google account
- OAuth 2.0 credentials (client ID an a client secret)

You follow the [Google Identity OAuth 2.0 Guideline](https://developers.google.com/identity/protocols/oauth2/openid-connect#appsetup) to create Web OAuth 2.0 credentials and don't forget to create a client ID for your web application. 
Finally, you should get a client ID and client secret.

# Setting up the client

1. Select the **Credentials** page in API Console
2. Click the client you have just created in the **OAuth 2.0 Client IDs** section
3. Set up the ****Authorized JavaScript origins****, which are origins where the logto authorization page is hosted.
4. Set up the ****Authorized redirect URIs****, which is used to redirect the user to the application after the user has logged in.

# Settings
| Name | Type |
| --- | --- |
| clientId | string |
| clientSecret | string |
