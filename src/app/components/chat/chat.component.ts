import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs"
import {ChatService} from "../../servics/chat.service";
import {IChatMassage} from "../../interfaces/i-chat-massage";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private stompClient: any;
  isConnected = false;
  private CHANNEL = "/topic/chat";
  private ENDPOINT = environment.chatEndPoint;
  messages: IChatMassage[] = [];
  chatFormGroup: FormGroup = new FormGroup({
    // Validators massage in not null
    message: new FormControl('', Validators.required),
    from: new FormControl('')
  })
  /*message = '';
  from = '';*/
  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    let ws = new SockJS(this.ENDPOINT);
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect({}, function () {
      that.isConnected = true;
      that.subScribeToGlobalChat();
    });
  }

  private subScribeToGlobalChat() {
    let that = this;
    this.stompClient.subscribe(this.CHANNEL, (message: any) => {

      let parse = JSON.parse(message.body) as IChatMassage;

      that.messages.push(parse)
    });
  }

  onSubmit() {
    let controls = this.chatFormGroup.controls;
    // console.log('from :',this.from);
    let data: IChatMassage = {
      from: controls.from.value,
      message: controls.message.value
    }
    controls.message.setValue('');
    if (!this.isConnected) {
      alert('Please connect to Websocket')
      return;
    }
    this.chatService.postMessageV2(data).subscribe(value => {
      // console.log(value);
    }, error => {
      // console.log(error);
    });
  }
}
