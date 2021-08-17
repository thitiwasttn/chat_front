import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {Channel} from "../models/channel.model";

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  channelUrl: string;

  constructor(private http: HttpClient) {
    this.channelUrl = environment.backendUrl + "/channel";
  }

  getAllChannel(): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<Channel>>(this.channelUrl + "/channels", {observe: 'response'});
  }
}
