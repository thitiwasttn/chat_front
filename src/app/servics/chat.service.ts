import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
// import {IChat} from "../interfaces/i-chat";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  postMessage(message: string, from: string): Observable<any>{
    let url = "http://localhost:8081/chat/message";
    let body = {
      message: message,
      from: from
    }
    return this.http.post<any>(url, body);
  }
}
