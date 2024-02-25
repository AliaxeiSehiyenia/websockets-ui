export interface IWinner {
    userId: string
    name: string;
    wins: number;
    addOneWin?: () => void;
}

export class Winner implements IWinner {
    userId: string
    name: string;
    wins: number;
    addOneWin: () => void;

    constructor(userId: string, name: string, wins: number) {
        this.name = name;
        this.wins = wins;
        this.userId = userId
    }
}