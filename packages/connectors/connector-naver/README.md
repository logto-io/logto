# Naver Connector

The Naver connector provides a succinct way for your application to use Naver’s OAuth 2.0 authentication system.

## Developer Site Only Korean Support Now
Currently `Naver Developers` site only supports Korean. Please consider use a translator.

## For the Production
- For the production, you have to get review from Naver team. 
Otherwise, only registered users can sign in.
  - You can add a tester from `맴버관리(Member Manage)` menu.
- To get a review, please check `애플리케이션 개발 상태(Application Devlopment Status)` 
from `API 설정(API Setting)` from your application project setting.


## Set up a project in the Naver Developers
- Visit the [Naver Developers](https://developers.naver.com/main/) and sign in with your Naver account.
- Click the **Application -> 어플리케이션 등록** from the menu to create new project.
- Follow the instruction below to create application.

### Application Name (어플리케이션 이름)
- Type your application name on `어플리케이션 이름` (This name is shown while a user sign in.)

### API Usage (사용 API)
- Choose `네이버 로그인(Naver Login)` for `사용 API(API Usage)`
- Check `이메일 주소(Email Address), 별명(Nickname), 프로필 사진(Profile Image)` as `필수(Neccessary)` from `권한(Role)` (You can check `추가(Add)` as optional these options, but you cannot get the information from the user.)

### Sign in Open API Service Environment (로그인 오픈 API 서비스 환경)
- For `로그인 오픈 API 서비스 환경(Sign in Open API Service Environment)`, add two environment `PC웹(PC Web)` and `모바일웹(Mobile Web)`.

#### PC Web (PC 웹)
- For `서비스 URL(Service URL)`, type `http(s)://YOUR_URL` (ex. https://logto.io)
- For `네이버 로그인(Naver Login) Callback URL`, type `http(s)://YOUR_URL/callback/${connector_id}`  (e.g. https://logto.io/callback/${connector_id})

#### Mobile Web (Mobile 웹)
- For `서비스 URL(Service URL)`, type `http(s)://YOUR_URL` (ex. https://logto.io)
- For `네이버 로그인(Naver Login) Callback URL`, type `http(s)://YOUR_URL/callback/${connector_id}`  (e.g. https://logto.io/callback/${connector_id})

> ⚠️ **Caution**
> 
> The `connector_id` can be found on the top bar of the Logto Admin Console connector details page.

## Configure Logto

### Config types

| Name         | Type   |
|--------------|--------|
| clientId     | string |
| clientSecret | string |

#### clientId
`clientId` is `Client ID` of your project.
(You can find it from `애플리케이션 정보(Application Info)` of your project from Naver developers.)

#### clientSeceret
`clientSecret` is `Client Secret` of your project.
(You can find it from `애플리케이션 정보(Application Info)` of your project from Naver developers.)

