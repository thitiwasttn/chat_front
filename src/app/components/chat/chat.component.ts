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
import {Message} from "stompjs";
import {RxStompState} from "@stomp/rx-stomp";


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

  constructor(private chatService: ChatService,
              private rxStompService: RxStompService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.params.subscribe(params => this.params = params);
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.setChatChennel();
  }

  initStomp() {
  }

  ngAfterContentInit() {
  }

  connectWebSocketV2() {
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

  subscribeTime() {
    let finalChannel = "/topic/" + this.chatFormGroup.controls.channel.value;
    // console.log('finalChannel :', finalChannel);
    this.watchTime = this.rxStompService.watch(finalChannel).subscribe((message: Message) => {
      let parse = JSON.parse(message.body) as IChatMassage;
      this.messages.push(parse)
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

  private setChatChennel() {
    for (let i = 0; i < 10; i++) {
      this.chatChannel.push(i + "");
    }
    this.chatFormGroup.controls['channel'].setValue('0', {onlySelf: true});
  }

  connect() {
    this.connectWebSocketV2();
    this.subscribeTime();
  }
}
