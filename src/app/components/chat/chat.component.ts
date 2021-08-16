import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatFormGroup: FormGroup = new FormGroup({
    // Validators massage in not null
    message: new FormControl('', Validators.required)
  })

  constructor() {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log('hi :', this.chatFormGroup.controls.message.value)
  }
}
