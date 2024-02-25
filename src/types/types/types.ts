import {IShip} from "../entities/ship";
import {IShipPosition} from "../entities/sellCoordinate";

export type Nullable<T> = T | null;

export type ShipType = 'small' | 'medium' | 'large' | 'huge';
export type SellType = 'free' | 'uh' | 'ul' | 'um' | 'us' | 'dh' | 'dl' | 'dm' | 'ds';
export type AttackResultType = 'miss' | 'killed' | 'shot';

export type BattlefieldMatrixType = Array<Array<SellType>>;

export interface IRegistrationRequestData {
    name: string;
    password: string;
}

export interface IAddUserToRoomRequestData {
    indexRoom: string;
}

export interface IAddUserShipsRequestData {
    gameId: string;
    ships: Array<IShip>;
    indexPlayer: string;
}

export interface IAttackRequestData {
    x: number;
    y: number;
    gameId: string;
    indexPlayer: string;
}

export interface IRandomAttackRequestData {
    gameId: string;
    indexPlayer: string;
}

export interface IAttackResponseData {
    position: IShipPosition;
    currentPlayer: string;
    status: AttackResultType;
}

export interface IAtackResult {
    attackedSell: SellType;
    updatedMatrix: Nullable<BattlefieldMatrixType>;
    isKilled: boolean;
}

export interface IShipKillAttackResult {
    aroundShotsCoords: Array<IShipPosition>;
    killedShipSells: Array<IShipPosition>;
}