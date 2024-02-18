export interface IUser {
    name: string;
    password: string;
    id: string;
    wins: number;
    isOnline: boolean;
}

export class User implements IUser {
    name: string;
    password: string;
    id: string;
    wins: number;
    isOnline: boolean

    constructor(name: string, id: string, password: string, wins: number, isOnline: boolean) {
        this.name = name;
        this.id = id;
        this.password = password;
        this.wins = wins;
        this.isOnline = isOnline
    }
}