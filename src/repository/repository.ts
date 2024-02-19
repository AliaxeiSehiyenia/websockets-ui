import {IUser, User} from "../types/entities/user";
import {IRegRequestData} from "../types/commands/registration";
import {commandTypes} from "../types/entities/commandTypes";
import {createResponseMessage} from "../utils/messageParser";
import colorize from "../utils/colorize";
import * as uuid from 'uuid';
import {ICreateRoomResponse} from "../types/entities/messages";
import {IRoom, Room} from "../types/entities/room";

export class Repository {
    users: Array<IUser> = [];
    rooms: Array<IRoom> = [];
    roomCounter = 0;

    registrationOrLogin(data: IRegRequestData, type: commandTypes, id: number, ws: WebSocket) {
        const existedUser = this.users.find((user) => user.name === data.name);
        if (existedUser) {
            if (existedUser.password === data.password) {
                ws.send(createResponseMessage(type, id, {
                    name: existedUser.name,
                    id: existedUser.id,
                    error: false,
                    errorText: ''
                }));
                this.users = [...this.users, {...existedUser, isOnline: true}];
                console.log(colorize(existedUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
            } else {
                ws.send(createResponseMessage(type, id, {
                    name: '',
                    id: 0,
                    error: true,
                    errorText: 'Wrong password',
                }));
            }
            return;
        }

        const newUser = new User(data.name, uuid.v4(), data.password, 0, true, ws);
        this.users = [...this.users, newUser];
        ws.send(createResponseMessage(type, id, {
            name: newUser.name,
            id: newUser.id,
            error: false,
            errorText: '',
        }));
        console.log(colorize(newUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
    }

    createRoom(type: commandTypes, id: number, ws: WebSocket): ICreateRoomResponse {
        type = commandTypes.UPDATE_ROOM;
        this.roomCounter++;
        const roomOwner = this.users.find((user) => user.ws === ws) as IUser;
        this.rooms = [...this.rooms, new Room(this.roomCounter, [roomOwner])];
        ws.send(createResponseMessage(type, id, this.rooms));
        return {
            type,
            id,
            data: this.rooms,
        };
    }
}
