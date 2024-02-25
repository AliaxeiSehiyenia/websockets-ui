export interface IShipPosition {
    x: number;
    y: number;
}

export class SellCoordinate implements IShipPosition {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}