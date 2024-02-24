import {IUser, User} from "../types/entities/user";
import {IRegistrationRequestData} from "../types/commands/registration";
import {commandTypes} from "../types/entities/commandTypes";
import {createResponseMessage} from "../utils/messageParser";
import colorize from "../utils/colorize";
import * as uuid from 'uuid';
import {ICreateRoomResponse} from "../types/entities/messages";
import {IRoom, Room} from "../types/entities/room";
import {IWinner} from "../types/entities/winner";

class MessageHandler {
    users: Array<IUser> = [];
    rooms: Array<IRoom> = [];
    winners: Array<IWinner> = [];
    roomCounter = 0;

    onlineUsers = this.users.filter(item => item.isOnline)

    registrationOrLogin(data: IRegistrationRequestData, type: commandTypes, id: number, ws: WebSocket) {
        const existedUser = this.users.find((user) => user.name === data.name);
        if (existedUser) {
            if (existedUser.password === data.password) {
                if (this.users.filter(item => item.name === existedUser.name)) {
                    ws.send(createResponseMessage(type, id, {
                        name: '',
                        id: 0,
                        error: true,
                        errorText: 'You have already logged in via other device'
                    }));
                    return;
                }
                this.users = this.users.map((user) => {
                    if (user.name === existedUser.name) {
                        user.ws = ws;
                        return user;
                    } else {
                        return user;
                    }
                });
                ws.send(createResponseMessage(type, id, {
                    name: existedUser.name,
                    id: existedUser.id,
                    error: false,
                    errorText: ''
                }));
                this.users = [...this.users, {...existedUser, isOnline: true}];
                console.log(colorize(existedUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));

                console.log(colorize('users online: ', 'magenta') + colorize(this.onlineUsers.length, 'cyan'));
                ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, id, this.rooms));
                ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, id, this.winners));
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
        console.log(colorize('users online: ', 'magenta') + colorize(this.onlineUsers.length, 'cyan'));
        ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, id, this.rooms));
        ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, id, this.winners));
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

export const messageHandler = new MessageHandler();
