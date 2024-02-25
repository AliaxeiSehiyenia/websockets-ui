import {ShipType} from "../types/types";
import {IShipPosition} from "./sellCoordinate";

export interface IShip {
    position: IShipPosition;
    direction: boolean;
    length: number;
    type: ShipType;
}

export class Ship implements IShip {
    position: IShipPosition;
    direction: boolean;
    length: number;
    type: ShipType;

    constructor(position: IShipPosition, direction: boolean, length: number, type: ShipType) {
        this.position = position;
        this.direction = direction;
        this.length = length;
        this.type = type;
    }
}