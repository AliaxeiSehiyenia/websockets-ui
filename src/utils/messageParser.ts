import {IMessage} from "../types/entities/message";

export function parseRequestMessageString(message: string): IMessage {
    return JSON.parse(message) as IMessage;
}
