import { CubeCoordinates } from "./HexGrid";

export type Coordinate = keyof CubeCoordinates;

export type DirectionInfo = {
    groupBy: Coordinate,
    sortBy: Coordinate
}

export enum Directions {
    NORTH = 'w',
    NORTH_EAST = 'e',
    NORTH_WEST = 'q',
    SOUTH = 's',
    SOUTH_EAST = 'd',
    SOUTH_WEST = 'a',
}

export const HEX_GROUP_DIRECTIONS: Map<Directions, DirectionInfo> = new Map([
    [Directions.NORTH, { groupBy: 'x', sortBy: 'z' }],
    [Directions.SOUTH, { groupBy: 'x', sortBy: 'y' }],
    [Directions.NORTH_WEST, { groupBy: 'z', sortBy: 'x' }],
    [Directions.SOUTH_EAST, { groupBy: 'z', sortBy: 'y' }],
    [Directions.NORTH_EAST, { groupBy: 'y', sortBy: 'z' }],
    [Directions.SOUTH_WEST, { groupBy: 'y', sortBy: 'x' }]
]);
