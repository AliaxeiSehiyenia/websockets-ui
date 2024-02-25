import {IMessage} from "../types/entities/messages";
import {commandTypes} from "../types/entities/commandTypes";
import colorize from "./colorize";

export function createResponseMessage(type: commandTypes, data: unknown, id?: number): string {
    const ResponseMessage = JSON.stringify({type: type, data: JSON.stringify(data)})
    console.log(colorize('ResponseMessage ', 'yellow') + ResponseMessage)
    return ResponseMessage
}

export function parseRequestMessageString(message: string): IMessage {
    console.log(colorize('RequestMessage ', 'purple') + message)
    // const data = JSON.parse(message) as IMessage
    // console.log(colorize('Request type: ', 'yellow') + colorize(data.type, 'cyan'));
    return JSON.parse(message) as IMessage;
}
