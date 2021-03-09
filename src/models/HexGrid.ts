import { Point } from "./Point";

export enum HexType {
    BASE,
    GAME
}

export interface CubeCoordinates extends Point {
    readonly z: number;
}

export interface CubeCoordinatesWithValue extends CubeCoordinates {
    readonly value: number;
}

export interface GameHex extends CubeCoordinatesWithValue {
    readonly points: string;
    readonly top: number;
    readonly left: number;
    readonly type: HexType;
}

export type FilledGrid<T> = Map<number, T>;

export interface HexGameGrid<T extends GameHex> {
    baseGrid: T[],
    filledGrid: FilledGrid<T>
}


