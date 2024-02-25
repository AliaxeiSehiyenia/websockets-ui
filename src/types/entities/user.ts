export interface IUser {
    name: string;
    password: string;
    id: string;
    wins: number;
    isOnline: boolean;
    ws: WebSocket
}

export class User implements IUser {
    name: string;
    password: string;
    id: string;
    wins: number;
    isOnline: boolean
    ws: WebSocket

    constructor(name: string, id: string, password: string, wins: number, isOnline: boolean, ws: WebSocket) {
        this.name = name;
        this.id = id;
        this.password = password;
        this.wins = wins;
        this.isOnline = isOnline
        this.ws = ws
    }
}