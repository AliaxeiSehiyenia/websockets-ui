import {commandTypes} from './commandTypes';
import {IRoom} from "./room";

export interface IMessage {
    type: commandTypes;
    data: string;
    id: number;
}

export interface ICreateRoomResponse {
    type: commandTypes;
    id: number;
    data: Array<IRoom> | string;
}