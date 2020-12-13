import cors from "cors";
import express from "express";
import * as http from "http";
import { Message } from "./model";

export class ChatServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;
  private ROOM_COUNTER = 1;
  private userIndex: any = {};

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void {
    this.app = express();
    this.app.use(cors());
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || ChatServer.PORT;
  }

  private sockets(): void {
    this.io = require("socket.io").listen(this.server, { origins: '*:*' });
  }

  private allRooms(): string[] {
    return Object.keys(this.io.sockets.adapter.rooms);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });

    this.io.on("connect", (socket: any) => {
      console.log(`Connected client (socketId: ${socket.id}) on port ${this.port}`);

      // join default room
      socket.join('Default Room');

      // default message handler
      socket.on("message", (m: Message) => {
        console.log(`[server](message): ${JSON.stringify(m)} (${m?.socketId})`);

        if (m?.socketId) {
          // sending to all clients in a particular room, including sender
          this.io.in(m.socketId).emit("message", m);
        } else {
          // sending to all connected clients
          this.io.in('Default Room').emit("message", m);
        }

        // save user-socketId to userIndex
        if (m?.from.name) {
          this.userIndex[socket.id] = m.from.name;
          console.log('userIndex', this.userIndex);
        }

        // broadcast a new join to entire channel/room
        this.io.in('Default Room').emit('getMembers', { userIndex: this.userIndex, roomInfo: this.io.sockets.adapter.rooms });
      });

      // create a room
      socket.on("create", async () => {
        const roomName = `Room ${this.ROOM_COUNTER++}`;
        console.log("[server](create): Creating %s", roomName);

        await socket.join(roomName);

        // sending to all clients except sender
        await this.io.emit("addRoom", roomName);

        console.log("all rooms:", this.io.sockets.adapter.rooms);

        // update room list for all clients
        this.io.emit("getAllRooms", this.allRooms());
      });

      // Join a room
      socket.on("join", async (roomName: string) => {
        console.log("[server](join): joining a room -> %s", roomName);

        await socket.join(roomName);

        // broadcast a new join to entire channel/room
        this.io.in(roomName).emit('getMembers', { userIndex: this.userIndex, roomInfo: this.io.sockets.adapter.rooms });
      });

      // get list of all rooms
      socket.on("getAllRooms", () => {
        console.log("[server](getAllRooms):", this.allRooms());
        this.io.emit("getAllRooms", this.allRooms());
      });

      // get list of users in a room
      socket.on("getMembers", (roomName: string) => {
        console.log("[server](getMembers):", this.allRooms());
        this.io.emit("getMembers", this.allRooms());
      });

      // leave a room
      socket.on("leave", (roomName: string) => {
        console.log("[server](leave): leaving a room -> %s", roomName);

        socket.leave(roomName);

        // broadcast updated user list to entire channel/room
        this.io.in(roomName).emit('getMembers', { userIndex: this.userIndex, roomInfo: this.io.sockets.adapter.rooms });
      });

      // disconnect socket
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
