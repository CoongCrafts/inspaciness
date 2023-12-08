import EventEmitter from 'eventemitter3';

export const eventEmitter = new EventEmitter<EventName>();

export enum EventName {
  SHOW_LOGIN_POPUP = 'SHOW_LOGIN_POPUP',
  SHOW_NEW_POST_POPUP = 'SHOW_NEW_POST_POPUP',
}
