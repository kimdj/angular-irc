import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatList, MatListItem } from '@angular/material/list';
import { DialogUserType } from './dialog-user/dialog-user-type';
import { DialogUserComponent } from './dialog-user/dialog-user.component';
import { Action } from './shared/model/action';
import { Event } from './shared/model/event';
import { Message } from './shared/model/message';
import { User } from './shared/model/user';
import { SocketService } from './shared/services/socket.service';
import { StoreUserService } from './shared/services/store-user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
  action = Action;
  user: User;
  messages: Message[] = [];
  messageContent: string;
  ioConnection: any;
  storedUserName: string;
  dialogRef: MatDialogRef<DialogUserComponent> | null;
  defaultDialogUserParams: any = {
    disableClose: true,
    data: {
      dialogType: DialogUserType.NEW
    }
  };
  currentSocketId = 'Default Room';
  members = [];

  // getting a reference to the overall list, which is the parent container of the list items
  @ViewChild(MatList, { read: ElementRef, static: true }) matList: ElementRef;

  // getting a reference to the items/messages within the list
  @ViewChildren(MatListItem, { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private socketService: SocketService,
    private storedUser: StoreUserService,
    public dialog: MatDialog) {
    console.log('instantiating chat component!');
  }

  ngOnInit(): void {
    this.initModel();
    setTimeout(() => {
      this.openUserPopup(this.defaultDialogUserParams);
    }, 0);

    // subscribing to reload chat window
    this.socketService.reloadChatWindow.subscribe((payload) => {
      if (payload.socketId) {
        this.messages.length = 0;
        this.currentSocketId = payload.socketId;
        console.log('LOADING CURRENT SOCKET ID', this.currentSocketId);
        this.socketService.joinRoom(this.currentSocketId);
        this.sendNotification({ user: this.user.name }, Action.JOINED);
      }
    });
  }

  ngAfterViewInit(): void {
    // subscribing to any changes in the list of items / messages
    this.matListItems.changes.subscribe(elements => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    try {
      this.matList.nativeElement.scrollTop = this.matList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  private initModel(): void {
    const randomId = this.getRandomId();
    this.user = {
      id: randomId
    };
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        this.messages.push(message);
      });


    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });

    this.socketService.onGetAllRooms()
      .subscribe((rooms) => {
        console.log('list of all rooms: ', rooms);
        this.socketService.roomList = rooms;
      });

    this.socketService.onGetMembers()
      .subscribe((payload: any) => {
        console.log('payload', payload);
        const userSocketIds = payload.roomInfo[this.currentSocketId].sockets;
        const userList = Object.keys(userSocketIds).map(e => payload.userIndex[e]);
        this.members = userList;
      })
  }

  private getRandomId(): number {
    return Math.floor(Math.random() * (1000000)) + 1;
  }

  private openUserPopup(params): void {
    this.dialogRef = this.dialog.open(DialogUserComponent, params);
    this.dialogRef.afterClosed().subscribe(paramsDialog => {
      if (!paramsDialog) {
        return;
      }
      this.user.name = paramsDialog.username;
      this.storedUser.storeUser(this.user.name);
      this.initIoConnection();
      this.sendNotification(paramsDialog, Action.JOINED);
    });
  }

  public sendMessage(message: string): void {
    if (!message) {
      return;
    }

    this.socketService.send({
      from: this.user,
      content: message,
      socketId: this.currentSocketId
    });
    this.messageContent = null;
  }

  public sendNotification(params: any, action: Action): void {
    let message: Message;

    if (action === Action.JOINED) {
      message = {
        from: this.user,
        action
      };
    }

    this.socketService.send(message);
  }

  leaveRoom() {
    this.socketService.leaveRoom(this.currentSocketId);
    this.sendNotification({ user: this.user.name }, Action.LEFT);
    this.currentSocketId = 'Default Room';
  }

  test() {
    console.log(this.matList);
    console.log(this.matListItems);
    this.messages.length = 0;
  }
}
