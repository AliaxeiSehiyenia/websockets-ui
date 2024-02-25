import {IActiveGamePlayer} from "./activeGamePlayer";
import {IShipPosition} from "./sellCoordinate";

export interface IActiveGame {
    gameId: string;
    gamePlayersData: Array<IActiveGamePlayer>;
    currentPlayer: string;

    addNewUser(newUser: IActiveGamePlayer): void;

    addPlayerKilledShips(killedShipCoords: Array<IShipPosition>, playerIndex: string): void;

    changeCurrentPlayer(currentPlayerId: string): void;
}

export class ActiveGame implements IActiveGame {
    gameId: string;
    gamePlayersData: Array<IActiveGamePlayer>;
    currentPlayer: string;

    constructor(
        gameId: string,
        gamePlayersData: Array<IActiveGamePlayer>,
        currentPlayer: string
    ) {
        this.gameId = gameId;
        this.gamePlayersData = gamePlayersData;
        this.currentPlayer = currentPlayer;
    }

    addNewUser(newUser: IActiveGamePlayer) {
        this.gamePlayersData = [...this.gamePlayersData, newUser];
    }

    addPlayerKilledShips(killedShipCoords: Array<IShipPosition>, playerIndex: string) {
        this.gamePlayersData.map((playerData) => {
            if (playerData.indexPlayer === playerIndex && playerData.killedShips) {
                playerData.killedShips = [...playerData.killedShips, ...killedShipCoords];
            }
            return playerData;
        });
    }

    changeCurrentPlayer(currentPlayerIndex: string) {
        this.currentPlayer = currentPlayerIndex;
    }
}