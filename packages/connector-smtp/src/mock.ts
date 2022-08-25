export const mockedConfig = {
  host: '<test.smtp.host>',
  port: 80,
  password: '<password>',
  username: '<username>',
  fromEmail: '<notice@test.smtp>',
  templates: [
    {
      contentType: 'text/plain',
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
      subject: 'Logto Test with SMTP',
      usageType: 'Test',
    },
  ],
};
