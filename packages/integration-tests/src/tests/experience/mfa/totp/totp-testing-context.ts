export default class TotpTestingContext {
  private _totpSecret = '';
  private _userEmail = '';
  private _userPhone = '';
  private _username = '';
  private _userPassword = '';
  private _userId = '';
  private _socialUserId = '';

  public setUpTotpSecret(totpSecret: string) {
    this._totpSecret = totpSecret;
  }

  public setUpUserEmail(email: string) {
    this._userEmail = email;
  }

  public setUpUserPhone(email: string) {
    this._userPhone = email;
  }

  public setUpUsername(name: string) {
    this._username = name;
  }

  public setUpUserPassword(password: string) {
    this._userPassword = password;
  }

  public setUpUserId(id: string) {
    this._userId = id;
  }

  public setUpSocialUserId(id: string) {
    this._socialUserId = id;
  }

  public get totpSecret(): string {
    return this._totpSecret;
  }

  public get userEmail(): string {
    return this._userEmail;
  }

  public get userPhone(): string {
    return this._userPhone;
  }

  public get username(): string {
    return this._username;
  }

  public get userPassword(): string {
    return this._userPassword;
  }

  public get userId(): string {
    return this._userId;
  }

  public get socialUserId(): string {
    return this._socialUserId;
  }
}
