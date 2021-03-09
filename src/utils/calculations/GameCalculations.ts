import { HexType, CubeCoordinates, GameHex, HexGameGrid, CubeCoordinatesWithValue } from './../../models/HexGrid';
import { GroupInfo } from './../../models/GroupInfo';
import { DirectionInfo, Directions, HEX_GROUP_DIRECTIONS } from '../../models/Directions';
import * as _ from 'lodash';

export class GameCalculations {

    private static isEqual = (cell1: CubeCoordinates, cell2: CubeCoordinates) => cell1.x === cell2.x && cell1.y === cell2.y && cell1.z === cell2.z

    private static sortedByKey = <K>(cells: Map<number, K>): Map<number, K> =>
        new Map([...cells.entries()]
            .sort((cell1, cell2) => cell2[0] - cell1[0])
        );

    static updatedGameGridByNewCells = <T extends GameHex>(newCells: CubeCoordinatesWithValue[], gameGrid: HexGameGrid<T>): HexGameGrid<T> => {
        const updatedBaseGrid: T[] = [...gameGrid.baseGrid];
        const updatedGameGrid = new Map(gameGrid.filledGrid);
        let lastFilledCellId = gameGrid.filledGrid.size > 0 ? [...gameGrid.filledGrid.keys()][0] + 1 : 0;
        newCells.forEach((cell) => {
            const baseCellId = updatedBaseGrid.findIndex(base => GameCalculations.isEqual(base, cell));
            const newCell = {
                ...updatedBaseGrid[baseCellId],
                value: cell.value
            }
            updatedBaseGrid[baseCellId] = { ...newCell };
            updatedGameGrid.set(lastFilledCellId++, { ...newCell, type: HexType.GAME });
        })
        return {
            baseGrid: updatedBaseGrid,
            filledGrid: GameCalculations.sortedByKey(updatedGameGrid)
        }
    }

    private static isAvailableHexGridRow = <T extends CubeCoordinatesWithValue>(row: T[], originRowLength: number): boolean => {
        let isAvailbaleRow = false;
        if (row.length < originRowLength) {
            return true;
        } else {
            row.forEach((value: CubeCoordinatesWithValue, index: number) => {
                const nextHexValue = row[index + 1];
                if (nextHexValue && nextHexValue.value === value.value) {
                    isAvailbaleRow = true;
                    return false;
                }
            });
            return isAvailbaleRow;
        }
    }

    private static getAllFilledCells = <T extends CubeCoordinatesWithValue>(row: T[]) => row.filter((cell: T) => cell.value > 0);

    private static shiftHexCells = <T extends CubeCoordinatesWithValue>(rowCells: T[]): GroupInfo<T[]> => {
        let isUsedNextValue = false;
        let isChangedRow = false;
        const rowFlledCells = GameCalculations.getAllFilledCells(rowCells);
        const updatedRowCells: T[] = rowFlledCells.reduce((updatedCells: T[], currentCell: T, index: number) => {
            if (!isChangedRow) {
                isChangedRow = isUsedNextValue;
            }
            if (!isUsedNextValue) {
                const nextCell = rowFlledCells[index + 1];
                const newHexValue: T = !!nextCell && currentCell.value === nextCell.value
                    ? {
                        ...nextCell,
                        value: nextCell.value * 2
                    }
                    : currentCell;
                isUsedNextValue = newHexValue !== currentCell;
                updatedCells.push(newHexValue);
            } else {
                isUsedNextValue = false;
            }
            return updatedCells;
        }, []);
        return {
            data: updatedRowCells,
            isAvailable: GameCalculations.isAvailableHexGridRow(updatedRowCells, rowCells.length)
        };
    }

    private static groupHexsByDirection = <T extends CubeCoordinates>(coorForExpression: DirectionInfo, baseGrid: T[]): T[][] => _.chain(baseGrid)
        .groupBy(coorForExpression.groupBy)
        .map(data => _.sortBy(data, [coorForExpression.sortBy]))
        .value();


    static isActiveGame = <T extends GameHex>(gameGrid: HexGameGrid<T>): boolean => {
        for (const direction of Object.values(Directions)) {
            const coordinatesForGroup = HEX_GROUP_DIRECTIONS.get(direction);
            if (!!coordinatesForGroup) {
                const gridRows = GameCalculations.groupHexsByDirection(coordinatesForGroup, gameGrid.baseGrid);
                for (const row of gridRows) {
                    const gridFilledCells = GameCalculations.getAllFilledCells(row);
                    const isActiveRow = GameCalculations.isAvailableHexGridRow(gridFilledCells, row.length);
                    if (isActiveRow) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static play = <T extends GameHex>(direction: Directions, gameGrid: HexGameGrid<T>): GroupInfo<HexGameGrid<T>> => {
        const coordinatesForGroup = HEX_GROUP_DIRECTIONS.get(direction);
        const updatedBaseGrid = [...gameGrid.baseGrid];
        const updatedGameGrid = new Map();
        let isActiveGame = false;
        let isChangedGrid = false;
        if (coordinatesForGroup) {
            const gridRows: T[][] = GameCalculations.groupHexsByDirection(coordinatesForGroup, updatedBaseGrid);

            gridRows.forEach((row: T[]) => {
                const updatedRowCells = GameCalculations.shiftHexCells(row);
                isActiveGame = !isActiveGame ? updatedRowCells.isAvailable : true;
                row.forEach((cell, index) => {
                    const updatedCell = updatedRowCells.data[index];
                    const newFilledCell = {
                        ...cell,
                        value: index < updatedRowCells.data.length ? updatedCell.value : 0
                    };
                    isChangedGrid = !isChangedGrid ? newFilledCell.value !== cell.value : true;
                    const baseCellId = updatedBaseGrid.indexOf(cell);
                    updatedBaseGrid[baseCellId] = { ...newFilledCell };
                    if (updatedCell) {
                        const oldFilledCell = [...gameGrid.filledGrid.entries()]
                            .find(([_, value]) => GameCalculations.isEqual(value, updatedCell));
                        if (oldFilledCell) {
                            updatedGameGrid.set(oldFilledCell[0], { ...newFilledCell, type: HexType.GAME })
                        }
                    }
                });
            })
        }
        return {
            data: {
                baseGrid: updatedBaseGrid,
                filledGrid: GameCalculations.sortedByKey(updatedGameGrid)
            }, isAvailable: isActiveGame, isChanged: isChangedGrid
        };
    }
}