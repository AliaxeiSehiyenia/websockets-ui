import {IMessage} from "../types/entities/messages";
import {commandTypes} from "../types/entities/commandTypes";
import colorize from "./colorize";

export function createResponseMessage(type: commandTypes, id: number, data: unknown): string {
    const ResponseMessage = JSON.stringify({type: type, data: JSON.stringify(data), id: id})
    console.log("ResponseMessage", ResponseMessage)
    return ResponseMessage
}

export function parseRequestMessageString(message: string): IMessage {
    console.log("RequestMessage", message)
    // const data = JSON.parse(message) as IMessage
    // console.log(colorize('Request type: ', 'yellow') + colorize(data.type, 'cyan'));
    return JSON.parse(message) as IMessage;
}
