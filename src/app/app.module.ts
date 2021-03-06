import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {InjectableRxStompConfig, RxStompService} from "@stomp/ng2-stompjs";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent
  ],
    imports: [
        BrowserModule,
        // import HttpClientModule after BrowserModule.
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
    ],
  providers: [RxStompService,
    InjectableRxStompConfig],
  bootstrap: [AppComponent]
})
export class AppModule { }
