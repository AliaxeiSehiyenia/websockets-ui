import {IMessage} from "../types/entities/message";
import {commandTypes} from "../types/entities/commandTypes";
import colorize from "./colorize";

export function createResponseMessage(type: commandTypes, id: number, data: unknown): string {
    return JSON.stringify({type: type, data: JSON.stringify(data), id: id});
}

export function parseRequestMessageString(message: string): IMessage {
    const data = JSON.parse(message) as IMessage
    console.log(colorize('Request type: ', 'yellow') + colorize(data.type, 'cyan'));
    return data;
}
