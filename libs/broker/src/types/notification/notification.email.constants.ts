export const NOTIFICATION_EMAIL = 'notification_email';

export enum EmailTemplates {
  SIMPLE = 'simple',
  WITH_BUTTON = 'with_button',
}

export interface ISendMessage {
  to: string;
  subject: string;
  payload: ISendMessagePayload;
  template: EmailTemplates;
}

export interface ISendMessagePayload {
  body?: string;
  url?: string;
}

export interface ISendMessageWithButtonPayload extends ISendMessagePayload {
  button: string;
}
