import {AfterContentInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

/*import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs"*/
import {ChatService} from "../../servics/chat.service";
import {IChatMassage} from "../../interfaces/i-chat-massage";
import {environment} from "../../../environments/environment";
import {InjectableRxStompConfig, RxStompService} from "@stomp/ng2-stompjs";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {RxStompState} from "@stomp/rx-stomp";
import {Channel} from "../../models/channel.model";
import {ChannelService} from "../../servics/channel.service";
import {IMessageRequest} from "../../interfaces/i-message-request";
import {MessageModel} from "../../models/message-model.model";
import {Message} from "stompjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterContentInit {

  params: any;
  private stompClient: any;
  isConnected = false;
  private CHANNEL = "/topic/chat";
  private ENDPOINT = environment.chatEndPoint;
  messages: IChatMassage[] = [];
  watchTime: Subscription | undefined;
  chatChannel: string[] = [];
  chatFormGroup: FormGroup = new FormGroup({
    // Validators massage in not null
    message: new FormControl('', Validators.required),
    from: new FormControl(''),
    channel: new FormControl('')
  })
  channels: Channel[];
  messagesV2: MessageModel[];
  isFirstLoadMessage = true;

  constructor(private chatService: ChatService,
              private rxStompService: RxStompService,
              private route: ActivatedRoute,
              private router: Router,
              private channelService: ChannelService) {
    this.route.params.subscribe(params => this.params = params);
    this.channels = [];
    this.messagesV2 = [];
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    // this.setChatChennel();
    this.loadChannel();
  }

  initStomp() {
  }

  ngAfterContentInit() {
  }

  loadChannel() {
    this.channelService.getAllChannel().subscribe(value => {
      this.channels = value.body;
      this.channels.forEach(value1 => {
        this.chatChannel.push(value1.id + "");
      })
      this.chatFormGroup.controls['channel'].setValue(this.channels[0].id + "", {onlySelf: true});
    })
  }

  connectWebSocketV2() {
    if (this.isConnected) {
      this.watchTime?.unsubscribe();
    }
    const stompConfig: InjectableRxStompConfig = Object.assign({}, null, {
      brokerURL: environment.chatEndPoint,
      beforeConnect: () => {

      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 1000,
      debug: (msg: string): void => {
        console.log(new Date(), msg);
      }
    });
    this.rxStompService.configure(stompConfig);
    this.rxStompService.activate();
    /*this.rxStompService.stompClient.onConnect = () => {
      console.log('connected');
      // this.subscribeTime();
      // resolve();
    };*/
    this.rxStompService.stompClient.onDisconnect = () => {
      console.log('disconnected');
      this.stompClient = false;
    };
    this.rxStompService.stompClient.onWebSocketClose = () => {
      console.log('socket closed');
      this.stompClient = false;
    };
    this.rxStompService.stompClient.onStompError = (error) => {
      console.log('stomp error');
      this.stompClient = false;
    };
    this.rxStompService.connectionState$.subscribe(state => {
      // state is an Enum (Integer), RxStompState[state] is the corresponding string
      // console.log('state :',RxStompState[state]);
      this.isConnected = RxStompState[state] === 'OPEN';
    });
  }

  subscribeTime(channelId: number) {
    let finalChannel = "/topic/" + channelId;
    // console.log('finalChannel :', finalChannel);
    this.watchTime = this.rxStompService.watch(finalChannel).subscribe((message: Message) => {
      let parse = JSON.parse(message.body) as MessageModel;
      parse.clientReceiveDate = new Date();
      // console.log(parse);
      this.messagesV2.unshift(parse)
      /*let parse = JSON.parse(message.body) as IChatMassage;
      this.messages.push(parse)*/
    });
  }

  /*private connectWebSocket() {
    let ws = new SockJS(this.ENDPOINT);
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect({}, function () {
      that.isConnected = true;
      that.subScribeToGlobalChat();
    });
  }*/

  private subScribeToGlobalChat() {
    let that = this;
    this.stompClient.subscribe(this.CHANNEL, (message: any) => {

      let parse = JSON.parse(message.body) as IChatMassage;

      that.messages.push(parse)
    });
  }

  onSubmit() {
    let controls = this.chatFormGroup.controls;
    let data: IChatMassage = {
      from: controls.from.value,
      message: controls.message.value,
      channel: "/topic/" + this.chatFormGroup.controls.channel.value
    }
    controls.message.setValue('');
    this.chatService.postMessageV2(data).subscribe(value => {

    }, error => {
      console.log(error);
    });
  }

  connect() {
    this.connectWebSocketV2();
    this.subscribeTime(this.chatFormGroup.controls.channel.value);
    this.messagesV2 = [];
    this.getMessageByChannel();
  }

  private getMessageByChannel() {
    let channel = this.chatFormGroup.controls.channel.value;
    let param: IMessageRequest = {
      channelId: channel,
      limit: 10,
      page: 0
    }
    this.chatService.getListMessage(param).subscribe(value => {
      this.messagesV2.push(...value.body);
      console.log(this.messagesV2);
    }, error => {
      alert('cant get messages');
      console.error(error);
    });

  }

  testLoad() {
    this.chatChannel.forEach((value, index) => {
      console.log('channel : {} ', value)
      this.loadTest(parseInt(value));
    });
    /*for (let i = 1; i <= 2; i++) {
      console.log('channel : {} ', i)
      this.loadTest(i);
    }*/
  }

  randomStr(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private sendMessage() {

  }

  private loadTest(channel: number) {
    // this.subscribeTime(channel);
    let that = this;
    for (let i = 0; i < 10; i++) {
      setTimeout(function () {
        let message =  'IAM BOT : '+ that.randomStr(15);

        let data: IChatMassage = {
          from: "bot A channel " + channel,
          message: message,
          channel: "/topic/" + channel
        }
        that.chatService.postMessageV2(data).subscribe(value => {

        }, error => {
          console.log(error);
        });
      }, (i + 1) * 2000
      );
    }

  }
}
