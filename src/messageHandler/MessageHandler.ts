import WebSocket from 'ws';
import {IUser, User} from "../types/entities/user";
import {IAddUserToRoomRequestData, IRegistrationRequestData} from "../types/commands/registration";
import {commandTypes} from "../types/entities/commandTypes";
import {createResponseMessage} from "../utils/messageParser";
import colorize from "../utils/colorize";
import * as uuid from 'uuid';
import {ICreateRoomResponse} from "../types/entities/messages";
import {IRoom, Room} from "../types/entities/room";
import {IWinner} from "../types/entities/winner";
import {IncomingMessage} from "http";
import {Game} from "../types/entities/game";

class MessageHandler {
    users: Array<IUser> = [];
    rooms: Array<IRoom> = [];
    winners: Array<IWinner> = [];


    registrationOrLogin(data: IRegistrationRequestData, type: commandTypes, id: number, ws: WebSocket) {
        const existedUser = this.users.find((user) => user.name === data.name);
        if (existedUser) {
            if (existedUser.password === data.password) {
                if (this.users.filter(item => item.name === existedUser.name)) {
                    ws.send(createResponseMessage(type, {
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
                ws.send(createResponseMessage(type, {
                    name: existedUser.name,
                    id: existedUser.id,
                    error: false,
                    errorText: ''
                }));
                this.users = [...this.users, {...existedUser, isOnline: true}];
                console.log(colorize(existedUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
                console.log(colorize('users online: ', 'magenta')
                    + colorize((this.users.filter(item => item.isOnline)).length, 'cyan'));
                ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, this.rooms));
                ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, this.winners));
            } else {
                ws.send(createResponseMessage(type, {
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
        ws.send(createResponseMessage(type, {
            name: newUser.name,
            id: newUser.id,
            error: false,
            errorText: '',
        }));
        console.log(colorize(newUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
        console.log(colorize('users online: ', 'magenta')
            + colorize((this.users.filter(item => item.isOnline)).length, 'cyan'));
        ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, this.rooms));
        ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, this.winners));
    }

    createRoom(type: commandTypes, id: number, ws: WebSocket): ICreateRoomResponse {
        type = commandTypes.UPDATE_ROOM;
        const roomOwner = this.users.find((user) => user.ws === ws) as IUser;
        this.rooms = [...this.rooms, new Room(uuid.v4(), [roomOwner])];
        ws.send(createResponseMessage(type, this.rooms));
        return {
            type,
            id,
            data: this.rooms,
        };
    }

    addUserToRoom(
        data: IAddUserToRoomRequestData,
        type: commandTypes,
        id: number,
        ws: WebSocket,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        type = commandTypes.CREATE_GAME;
        const gameOwner = this.rooms.find((room) => room.roomId === data.indexRoom)
            ?.roomUsers[0] as IUser;
        const gameGuest = this.users.find((user) => user.ws === ws) as IUser;
        if (gameGuest.name === gameOwner.name) {
            console.log(`${gameGuest.name}, you have already joined this room`);
            return;
        }
        const ownerGameData = new Game(uuid.v4(), gameOwner.id);
        const guestGameData = new Game(uuid.v4(), gameGuest.id);

        gameOwner.ws?.send(
            JSON.stringify({
                type,
                id,
                data: JSON.stringify(ownerGameData),
            })
        );
        ws.send(
            JSON.stringify({
                type,
                id,
                data: JSON.stringify(guestGameData),
            })
        );

        this.rooms = this.rooms.filter((room) => room.roomId !== data.indexRoom);
        this.rooms = this.rooms.filter((room) => room.roomUsers[0]?.name !== gameGuest.name);
        this.rooms = this.rooms.filter((room) => room.roomUsers[0]?.name !== gameOwner.name);

        type = commandTypes.UPDATE_ROOM;
        const roomsData = JSON.stringify({
            type,
            id,
            data: JSON.stringify(this.rooms),
        });
        ws.send(roomsData);
        websocketsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(roomsData);
            }
        });
    }
}

export const messageHandler = new MessageHandler();
