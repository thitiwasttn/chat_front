export class MessageModel {

  constructor(public id?: number,
              public message?: string,
              public createBy?: string,
              public channelId?: number,
              public createDate?: Date) {
  }
}
