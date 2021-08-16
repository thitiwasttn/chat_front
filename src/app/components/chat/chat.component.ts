import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs"

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private stompClient: any;
  isConnected = false;
  private CHANNEL = "chat";
  private ENDPOINT = "http://localhost:8081/socket";
  chatFormGroup: FormGroup = new FormGroup({
    // Validators massage in not null
    message: new FormControl('', Validators.required)
  })

  constructor() {
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
    this.stompClient.subscribe(this.CHANNEL, (message: any) => {
      console.log('message :', message)
    });
  }

  onSubmit() {
    let message = this.chatFormGroup.controls.message.value;
    console.log('check connect :', this.isConnected);
    if (this.isConnected) {
      alert('Please connect to Websocket')
      return;
    }
    console.log('hi :', message)
  }
}
