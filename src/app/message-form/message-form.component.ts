import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Message } from '../models/message';
import { SpeechRecognizerService } from '../services/speech-recognizer.service';
import { SpeechSynthesizerService } from '../services/speech-synthesizer.service';
import { ActionContext } from '../models/action-context';
import { ApiCallerService } from '../services/api-caller.service';

@Component({
  selector: 'app-message-form',
  providers: [ SpeechRecognizerService, SpeechSynthesizerService, ApiCallerService ],
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.css']
})
export class MessageFormComponent implements OnInit {

  @Input('message')
  private message : Message;

  @Input('messages')
  private messages : Message[];

  @Output() onTopicIdentified = new EventEmitter();

  finalTranscript = '';
  recognizing = false;
  notification: string;
  languages: string[] =  ['en-US', 'es-ES', 'hi-IN', 'gu-IN'];
  currentLanguage: string;
  actionContext: ActionContext = new ActionContext();

  constructor(private speechRecognizer: SpeechRecognizerService,
              private speechSynthesizer: SpeechSynthesizerService,
              private _api: ApiCallerService,
              private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.currentLanguage = this.languages[0];
    this.speechRecognizer.initialize(this.currentLanguage);
    this.initRecognition();
    this.notification = null;
  }

  private initRecognition() {
    this.speechRecognizer.onStart()
      .subscribe(data => {
        this.recognizing = true;
        this.notification = 'I\'m listening...';
        this.detectChanges();
      });

    this.speechRecognizer.onEnd()
      .subscribe(data => {
        this.recognizing = false;
        this.detectChanges();
        this.notification = null;
      });

    this.speechRecognizer.onResult()
    .subscribe((data: any) => {
        var text: string = data.content.trim();
        if(text.split(" ").length >= 2 && data.info === "final_transcript") {
          this.actionContext.processMessage(text, this.currentLanguage);
          this.detectChanges();
          this.actionContext.runAction(text, this.currentLanguage);
          this.message = new Message(text, '../assets/images/user.png',new Date());
          // this.sendMessage();
        }
    });

    this.speechRecognizer.onError()
      .subscribe(data => {
        console.error(data.error);
        this.recognizing = false;
        this.detectChanges();
      });
    }

  detectChanges() {
    this.changeDetector.detectChanges();
  }

  public sendMessage(): void {
    this.message.timestamp = new Date();
    var question = this.messages.slice(-1)['content'];
    console.log(question);

    this.messages.push(this.message);
    this._api.doPostRequest("/therapy", {"question": question, "response": this.message.content}).subscribe(res => {
      console.log(res);
      if(res.reply != null) {
        this.messages.push(new Message(res.reply, "assets/images/bot.png", new Date()));
      }
    });

    // this.dialogFlowService.getResponse(this.message.content).subscribe(res => {
    //   this.messages.push(
    //     new Message(res.queryResult.fulfillmentText, 'assets/images/bot.png', res.timestamp)
    //   );
    //   if(res.queryResult.parameters != null) {
    //     this.onTopicIdentified.emit(res.queryResult.parameters.topic_name);
    //   }
    //   this.speechSynthesizer.speak(res.queryResult.fulfillmentText, "en-US");
    // });
    this.message = new Message('', 'assets/images/user.png');
  }

  public startButton($event) {
    if (this.recognizing) {
      this.speechRecognizer.stop();
      return;
    }

    this.speechRecognizer.start(event.timeStamp);
  }

}