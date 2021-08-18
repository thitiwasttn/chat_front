import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IChatMassage} from "../interfaces/i-chat-massage";
import {environment} from "../../environments/environment";
// import {IChat} from "../interfaces/i-chat";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatUrl = '';
  constructor(private http: HttpClient) {
    this.chatUrl = environment.backendUrl + '/chat/message'
  }

  postMessage(message: string, from: string): Observable<any>{
    let body = {
      message: message,
      from: from
    }
    return this.http.post<any>(this.chatUrl, body);
  }

  postMessageV2(data: IChatMassage): Observable<any>{
    return this.http.put<any>(this.chatUrl, data);
  }
}
