import {IUser} from "./user";

export interface IRoom {
    roomId: string;
    roomUsers: Array<IUser>;
}

export class Room implements IRoom {
    roomId: string;
    roomUsers: Array<IUser>;
    constructor(roomId: string, roomUsers: Array<IUser>) {
        this.roomId = roomId;
        this.roomUsers = roomUsers;
    }
}