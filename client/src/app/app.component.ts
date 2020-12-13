import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './chat/shared/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  rooms: string[];

  constructor(private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    this.socketService.roomList$.subscribe((rooms) => {
      this.rooms = rooms;
    });
  }

  createRoom() {
    this.socketService.createRoom();
  }

  reloadChatComponent(socketId) {
    console.log(socketId);
    this.socketService.reloadChatWindow.next({ socketId });
  }

  test() {
    console.log('TEST!');
    this.socketService.getAllRooms();
  }

}
