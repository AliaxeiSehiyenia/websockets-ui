import WebSocket from 'ws';
import {IRegRequestData} from "../types/commands/registration";
import {commandTypes} from "../types/entities/commandTypes";
import {Repository} from "../repository/repository";


class MessageService {
    private repository: Repository;

    constructor() {
        this.repository = new Repository()
    }

    registrationOrLogin(data: IRegRequestData, type: commandTypes, id: number, ws: WebSocket) {
        return this.repository.registrationOrLogin(data, type, id, ws)
    }
}

export const messageService = new MessageService();
