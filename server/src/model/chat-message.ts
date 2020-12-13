import { Message, User } from './';

export class ChatMessage extends Message {
    constructor(from: User, content: string, socketId: string) {
        super(from, content, socketId);
    }
}