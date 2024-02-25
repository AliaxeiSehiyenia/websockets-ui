export interface IGame {
    idGame: string;
    idPlayer: string;
}

export class Game implements IGame {
    idGame: string;
    idPlayer: string;

    constructor(idGame: string, idPlayer: string) {
        this.idGame = idGame;
        this.idPlayer = idPlayer;
    }
}