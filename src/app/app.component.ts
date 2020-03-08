import { Component, OnInit } from '@angular/core';
import { Message } from './models/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cbt-chatbot';

  public message : Message;
  public messages : Message[];

  constructor() {
    this.message = new Message('', 'assets/images/user.png');
    this.messages = [
        // tslint:disable-next-line: max-line-length
        new Message(`Hello! Thanks for coming here. I am a chatbot. People say that I am a kind and approachable bot.`, 'assets/images/bot.png', new Date()),
        new Message(`Hi Jimil ! My name's Rhea. Let's start with our session.`,'assets/images/bot.png', new Date()),
        new Message(`How are you doing?`,'assets/images/bot.png', new Date())
    ];
  }

}