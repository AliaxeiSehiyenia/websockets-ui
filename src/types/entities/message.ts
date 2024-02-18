import {commandTypes} from './commandTypes';

export interface IMessage {
    type: commandTypes;
    data: string;
    id: number;
}
