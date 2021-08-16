import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs"
import {ChatService} from "../../servics/chat.service";
import {IChatMassage} from "../../interfaces/i-chat-massage";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private stompClient: any;
  isConnected = false;
  private CHANNEL = "/topic/chat";
  private ENDPOINT = "http://localhost:8081/socket";
  private from = '';
  messages: IChatMassage[] = [];
  chatFormGroup: FormGroup = new FormGroup({
    // Validators massage in not null
    message: new FormControl('', Validators.required)
  })

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
      //console.log('message :', message.body)
      let parse = JSON.parse(message.body) as IChatMassage;
      /*let newMessage: IChatMassage = {
        created: new Date(),
        from: parse.from,
        massge: parse.message
      }*/
      that.messages.push(parse)
    });
  }

  onSubmit() {
    let message = this.chatFormGroup.controls.message.value;
    console.log('chatFormGroup', this.chatFormGroup.controls)
    // let from = this.chatFormGroup.controls.from.value;
    let from = "x";
    //console.log('check connect :', this.isConnected);
    if (!this.isConnected) {
      alert('Please connect to Websocket')
      return;
    }
    //console.log('hi :', message);
    this.chatService.postMessage(message, from).subscribe(value => {
      //console.log(value);
    }, error => {
      console.log(error);
    });
  }
}
