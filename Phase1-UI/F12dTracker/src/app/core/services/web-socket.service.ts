import { Injectable } from '@angular/core';
import { Client, Message, over } from 'stompjs';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient!: Client;
  private messageSubject = new Subject<string>();

  constructor() {}

  connect(): void {
    const socketUrl = 'http://localhost:4000/f1-live-websocket';
    const socket = new SockJS(socketUrl);
    this.stompClient = over(socket);

    this.stompClient.connect(
      {},
      () => {
        this.stompClient.subscribe('/topic/telemetry', (message: Message) => {
          if (message.body) {
            this.messageSubject.next(JSON.parse(message.body));
            console.log(JSON.parse(message.body));
          }
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      },
    );
  }

  get messages$(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}
