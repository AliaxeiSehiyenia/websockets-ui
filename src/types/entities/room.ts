import {IUser} from "./user";

export interface IRoom {
    roomId: number;
    roomUsers: Array<IUser>;
}

export class Room implements IRoom {
    roomId: number;
    roomUsers: Array<IUser>;
    constructor(roomId: number, roomUsers: Array<IUser>) {
        this.roomId = roomId;
        this.roomUsers = roomUsers;
    }
}