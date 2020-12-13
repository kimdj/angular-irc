import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { Event } from '../model/event';
import { Message } from '../model/message';

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
        this.getAllRooms();
    }

    /************************************************************************/

    public getAllRooms(): void {
        this.socket.emit('getAllRooms');
    }

    /************************************************************************/

    public send(message: Message): void {
        this.socket.emit('message', message);
    }

    public onMessage(): Observable<Message> {
        return new Observable<Message>(observer => {
            this.socket.on('message', (data: Message) => observer.next(data));
        });
    }

    /************************************************************************/

    private roomListSource = new BehaviorSubject([]);
    public roomList$ = this.roomListSource.asObservable();
    get roomList() {
        return this.roomListSource.getValue();
    }
    set roomList(updated) {
        this.roomListSource.next(updated);
    }

    public createRoom(): void {
        this.socket.emit('create');
    }

    public joinRoom(roomName: string): void {
        this.socket.emit('join', roomName);
    }

    public leaveRoom(roomName: string): void {
        this.socket.emit('leave', roomName);
    }

    public onGetAllRooms(): Observable<string[]> {
        return new Observable<string[]>(observer => {
            this.socket.on(Event.GET_ALL_ROOMS, (data: string[]) => observer.next(data));
        });
    }

    /************************************************************************/

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }

    public onGetMembers(): Observable<string[]> {
        return new Observable<string[]>(observer => {
            this.socket.on(Event.GET_MEMBERS, (data: any) => observer.next(data));
        });
    }

    /************************************************************************/

    public reloadChatWindow = new BehaviorSubject<any>({ socketId: null });
}
