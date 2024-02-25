import {BattlefieldMatrixType} from "../types/types";
import {IShipPosition} from "./sellCoordinate";
import {IShip} from "./ship";

export interface IActiveGamePlayer {
    ships: Array<IShip>;
    indexPlayer: string;
    shipsMatrix?: BattlefieldMatrixType;
    killedShips: Array<IShipPosition>;

    updateShipsMatrix(shipsMatrix: BattlefieldMatrixType): void;

    updateKilledShips(killedShips: Array<IShipPosition>): void;
}

export class ActiveGamePlayer implements IActiveGamePlayer {
    ships: Array<IShip>;
    indexPlayer: string;
    shipsMatrix?: BattlefieldMatrixType;
    killedShips: Array<IShipPosition>;

    constructor(
        ships: Array<IShip>,
        indexPlayer: string,
        killedShips: Array<IShipPosition>,
        shipsMatrix?: BattlefieldMatrixType
    ) {
        this.ships = ships;
        this.indexPlayer = indexPlayer;
        this.killedShips = killedShips;
        this.shipsMatrix = shipsMatrix;
    }

    updateShipsMatrix(shipsMatrix: BattlefieldMatrixType) {
        this.shipsMatrix = shipsMatrix;
    }

    updateKilledShips(killedShips: Array<IShipPosition>) {
        this.killedShips = killedShips;
    }
}