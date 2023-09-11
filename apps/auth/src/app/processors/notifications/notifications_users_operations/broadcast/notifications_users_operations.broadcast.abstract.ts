export interface INotificationSignUpPayload {
  email: string;
  token: string;
}

export type INotificationPasswordChangePayload = INotificationSignUpPayload;

export type INotificationEmailChangePayload = INotificationSignUpPayload;

export type INotificationPasswordRecoveryPayload = INotificationSignUpPayload;

export interface INotificationsUsersOperationsProcessor {
  onSignUp(payload: INotificationSignUpPayload): Promise<void>;

  onPasswordRecovery(
    payload: INotificationPasswordRecoveryPayload,
  ): Promise<void>;

  onPasswordChange(payload: INotificationPasswordChangePayload): Promise<void>;

  onEmailChange(payload: INotificationEmailChangePayload): Promise<void>;
}
