---
"@logto/connector-mock-standard-email": major
"@logto/connector-mock-email": major
"@logto/connector-mock-sms": major
"@logto/connector-kit": major
---

update mock connector file paths

Update the file paths used by mock connectors to store sent messages.

- `/tmp/logto_mock_email_record.txt` -> `/tmp/logto/mock_email_record.txt`
- `/tmp/logto_mock_sms_record.txt` -> `/tmp/logto/mock_sms_record.txt`

This can help create a more consistent and organized structure for the mock connector files, making it easier to manage and mount in the docker environment.
