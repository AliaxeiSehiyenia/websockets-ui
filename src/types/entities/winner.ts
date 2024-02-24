export interface IWinner {
    name: string;
    wins: number;
}

export class Winner implements IWinner {
    name: string;
    wins: number;
    constructor(name: string, wins: number) {
        this.name = name;
        this.wins = wins;
    }
}